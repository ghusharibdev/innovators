import type { DirectoryEntry } from "@/lib/validate";

/**
 * AI layer — DESIGN.md §10.
 * This is the ONLY file in the app that talks to Gemini. The model never touches the database.
 */

export type AIErrorKind = "config" | "timeout" | "http" | "empty" | "parse";

export class AIError extends Error {
  readonly kind: AIErrorKind;
  readonly status?: number;

  constructor(kind: AIErrorKind, message: string, status?: number) {
    super(message);
    this.name = "AIError";
    this.kind = kind;
    this.status = status;
  }

  get retryable(): boolean {
    if (this.kind === "timeout") return true;
    return this.status === 429 || (this.status !== undefined && this.status >= 500);
  }
}

/** SYSTEM_PROMPT — verbatim from DESIGN.md §10.2. */
const SYSTEM_PROMPT = `You are a precise meeting-to-project extractor for a project management CRM.

You receive a meeting transcript and the company's user directory.
Extract the FINAL AGREED decisions into projects and tasks.

HARD RULES
1. Extract ONLY final agreed decisions. If a value is mentioned and then corrected later,
   use the LAST agreed value. Ignore any earlier version.
2. Ignore every feature, task, or person that was explicitly rejected, excluded, or
   deferred to "future work".
3. Create one project per distinct client engagement. Never merge projects.
4. Use ONLY people from the supplied directory. Never invent a person.
   - project.managerId MUST be the "code" of a user whose role is MANAGER.
   - task.assignedId MUST be the "code" of a user whose role is AGENT.
5. Every project needs: name, clientName, managerId, deadline.
   Every task needs: title, assignedId, deadline, estimatedHours.
6. Deadlines are ISO dates "YYYY-MM-DD" in 2026. A task deadline must be
   on or before its project deadline.
7. estimatedHours is a positive integer representing developer effort only.
   Never convert calendar days into hours. Ignore any management-hour estimates.
8. Do not create separate tasks for topics that were described as one task.
   Do not split a single agreed task into multiple tasks.
9. Do not create tasks for end users, clients, or escalated questions —
   only for NovaWorks developers.
10. If a required field cannot be determined, omit the project/task rather than guessing.
11. Output ONLY JSON matching the required schema. No prose, no markdown.`;

/** RESPONSE_SCHEMA — verbatim from DESIGN.md §10.4 (Gemini structured output). */
const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    projects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          clientName: { type: "string" },
          description: { type: "string" },
          managerId: { type: "string" },
          deadline: { type: "string" },
          tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                assignedId: { type: "string" },
                deadline: { type: "string" },
                estimatedHours: { type: "integer" },
              },
              required: ["title", "assignedId", "deadline", "estimatedHours"],
            },
          },
        },
        required: ["name", "clientName", "managerId", "deadline", "tasks"],
      },
    },
  },
  required: ["projects"],
} as const;

/** buildUserPrompt — DESIGN.md §10.3. */
export function buildUserPrompt(
  transcript: string,
  directory: readonly DirectoryEntry[],
): string {
  const directoryLines = directory
    .map(
      (entry) =>
        `- ${entry.code} | ${entry.name} | ${entry.role} | ${entry.specialization} | ${entry.skills}`,
    )
    .join("\n");

  return `COMPANY DIRECTORY (use these codes exactly):
${directoryLines}

MEETING TRANSCRIPT:
"""
${transcript}
"""

Extract all final agreed projects and their tasks.`;
}

const AI_TIMEOUT_MS = 12_000;

type GeminiResponse = {
  candidates?: {
    content?: { parts?: { text?: string }[] };
    finishReason?: string;
  }[];
  error?: { message?: string };
};

async function callGemini(
  transcript: string,
  directory: readonly DirectoryEntry[],
): Promise<unknown> {
  const MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-3.1-flash-lite";
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim().length === 0) {
    throw new AIError(
      "config",
      "GEMINI_API_KEY is not configured. Add it to .env (see .env.example).",
    );
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      { role: "user", parts: [{ text: buildUserPrompt(transcript, directory) }] },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new AIError("timeout", "Gemini did not respond within 12 seconds.");
    }
    throw new AIError(
      "http",
      error instanceof Error ? error.message : "Network request to Gemini failed.",
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    let detail = "";
    try {
      const payload = (await response.json()) as GeminiResponse;
      detail = payload.error?.message ?? "";
    } catch {
      detail = "";
    }
    if (response.status === 429) {
      throw new AIError(
        "http",
        `Gemini rate limit reached on ${MODEL}. Please wait a moment and retry.`,
        429,
      );
    }
    if (response.status === 404) {
      throw new AIError(
        "http",
        `Model ${MODEL} is unavailable. Check GEMINI_MODEL in .env.`,
        404,
      );
    }
    throw new AIError(
      "http",
      `Gemini returned ${response.status}${detail ? `: ${detail}` : ""}`,
      response.status,
    );
  }

  const data = (await response.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new AIError("empty", "Gemini returned an empty response.");
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new AIError("parse", "Gemini returned malformed JSON.");
  }
}

/**
 * Extract the agreed projects/tasks from a transcript.
 * 12-second AbortController timeout with a single retry on 429/5xx or timeout.
 */
export async function extractFromTranscript(
  transcript: string,
  directory: readonly DirectoryEntry[],
): Promise<unknown> {
  // TEMP-VERIFICATION-HOOK
  if (process.env.AI_FIXTURE_FILE) {
    const { readFileSync } = await import("node:fs");
    return JSON.parse(readFileSync(process.env.AI_FIXTURE_FILE, "utf8")) as unknown;
  }
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await callGemini(transcript, directory);
    } catch (error) {
      lastError = error;
      const retryable = error instanceof AIError && error.retryable;
      if (!retryable || attempt === 1) throw error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new AIError("http", "AI provider unavailable. Please retry.");
}
