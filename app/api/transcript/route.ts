import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { AuthError, requireAdmin } from "@/lib/auth";
import { extractFromTranscript, AIError } from "@/lib/ai";
import { ExtractionSchema, resolveAndValidate, toDirectory } from "@/lib/validate";

export const runtime = "nodejs";
export const maxDuration = 30;

const MIN_TRANSCRIPT_LENGTH = 50;

/** In-process guard so a double submit from the same admin never doubles the data (R14). */
const inFlight = new Set<string>();

const BodySchema = z.object({
  transcript: z.string(),
});

function invalid(
  errors: { path: string; message: string }[],
  status = 422,
): NextResponse {
  return NextResponse.json({ status: "invalid", errors }, { status });
}

export async function POST(request: Request): Promise<NextResponse> {
  let adminId: string | null = null;

  try {
    // 1. Admin only.
    const admin = await requireAdmin();
    adminId = admin.id;

    if (inFlight.has(admin.id)) {
      return NextResponse.json(
        {
          status: "error",
          error: "An import is already running. Please wait for it to finish.",
        },
        { status: 409 },
      );
    }

    // 2. Body + transcript sanity.
    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return invalid([{ path: "transcript", message: "Invalid request body." }], 400);
    }

    const body = BodySchema.safeParse(raw);
    if (!body.success) {
      return invalid([{ path: "transcript", message: "Transcript is empty." }], 400);
    }

    const transcript = body.data.transcript.trim();
    if (transcript.length === 0) {
      return invalid([{ path: "transcript", message: "Transcript is empty." }], 400);
    }
    // Shape/semantic rejections are 422 so the UI shows the correction panel (§11.4, §15).
    if (transcript.length < MIN_TRANSCRIPT_LENGTH) {
      return invalid([
        {
          path: "transcript",
          message: `Transcript is too short (minimum ${MIN_TRANSCRIPT_LENGTH} characters).`,
        },
      ]);
    }

    // 3. Directory from DB — code, name, role, specialization, skills only. Never passwords.
    const users = await prisma.user.findMany({
      orderBy: { code: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        role: true,
        specialization: true,
        skills: true,
      },
    });

    const directory = toDirectory(users);
    const idByCode = new Map(users.map((user) => [user.code.toUpperCase(), user.id]));

    inFlight.add(admin.id);

    // 4. Ask Gemini. The model never touches the database.
    let aiOutput: unknown;
    try {
      aiOutput = await extractFromTranscript(transcript, directory);
    } catch (error) {
      if (error instanceof AIError) {
        const message =
          error.kind === "config"
            ? error.message
            : "AI provider unavailable. Please retry.";
        return NextResponse.json({ status: "error", error: message }, { status: 502 });
      }
      console.error("Gemini extraction failed:", error);
      return NextResponse.json(
        { status: "error", error: "AI provider unavailable. Please retry." },
        { status: 502 },
      );
    }

    // 5. Shape validation.
    const parsed = ExtractionSchema.safeParse(aiOutput);
    if (!parsed.success) {
      return invalid(
        parsed.error.issues.map((issue) => ({
          path: issue.path.join(".") || "projects",
          message: issue.message,
        })),
      );
    }

    // 6. Semantic validation — collects every problem, saves nothing on failure.
    const validated = resolveAndValidate(parsed.data, directory);
    if (!validated.ok) {
      return invalid(validated.errors);
    }

    // 7. All-or-nothing save.
    const created = await prisma.$transaction(
      async (tx) => {
        const results: { id: string; name: string; taskCount: number }[] = [];

        for (const project of validated.resolved) {
          const managerId = idByCode.get(project.managerId.toUpperCase());
          if (!managerId) {
            throw new Error(`Unresolved manager code ${project.managerId}`);
          }

          const createdProject = await tx.project.create({
            data: {
              name: project.name,
              clientName: project.clientName,
              description: project.description,
              managerId,
              deadline: project.deadline,
              tasks: {
                create: project.tasks.map((task) => {
                  const assigneeId = idByCode.get(task.assigneeId.toUpperCase());
                  if (!assigneeId) {
                    throw new Error(`Unresolved assignee code ${task.assigneeId}`);
                  }
                  return {
                    title: task.title,
                    description: task.description,
                    assigneeId,
                    deadline: task.deadline,
                    estimatedHours: task.estimatedHours,
                  };
                }),
              },
            },
            select: {
              id: true,
              name: true,
              _count: { select: { tasks: true } },
            },
          });

          results.push({
            id: createdProject.id,
            name: createdProject.name,
            taskCount: createdProject._count.tasks,
          });
        }

        return results;
      },
      { timeout: 15_000 },
    );

    const taskCount = created.reduce((sum, project) => sum + project.taskCount, 0);
    const hours = validated.resolved
      .flatMap((project) => project.tasks)
      .reduce((sum, task) => sum + task.estimatedHours, 0);

    return NextResponse.json(
      {
        status: "ok",
        created: {
          projects: created.length,
          tasks: taskCount,
          hours,
          projectIds: created.map((project) => project.id),
        },
        projects: created,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST /api/transcript failed:", error);
    return NextResponse.json(
      { status: "error", error: "The import failed and nothing was saved. Please retry." },
      { status: 500 },
    );
  } finally {
    if (adminId) inFlight.delete(adminId);
  }
}