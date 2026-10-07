import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Minimal, dependency-free .env loader for standalone scripts (prisma/seed.ts).
 * Next.js loads .env automatically; tsx does not. Existing process env always wins.
 */
export function loadEnv(): void {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  const contents = readFileSync(envPath, "utf8");
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const match = line.match(/^(?:export\s+)?([\w.-]+)\s*=\s*(.*)?$/);
    if (!match) continue;

    const key = match[1];
    if (key in process.env) continue;

    let value = (match[2] ?? "").trim();
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length > 1) ||
      (value.startsWith("'") && value.endsWith("'") && value.length > 1)
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}
