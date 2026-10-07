import { z } from "zod";
import type { Role } from "@prisma/client";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Shape of the AI's structured output. */
export const ExtractionSchema = z.object({
  projects: z
    .array(
      z.object({
        name: z.string().min(2),
        clientName: z.string().min(2),
        description: z.string().default(""),
        managerId: z.string().min(1),
        deadline: z.string().regex(ISO_DATE, "Expected an ISO date (YYYY-MM-DD)."),
        tasks: z
          .array(
            z.object({
              title: z.string().min(2),
              description: z.string().default(""),
              assignedId: z.string().min(1),
              deadline: z.string().regex(ISO_DATE, "Expected an ISO date (YYYY-MM-DD)."),
              estimatedHours: z.number().int().positive(),
            }),
          )
          .min(1),
      }),
    )
    .min(1),
});

export type Extraction = z.infer<typeof ExtractionSchema>;
export type ExtractionProject = Extraction["projects"][number];
export type ExtractionTask = ExtractionProject["tasks"][number];

/** The subset of a user that the AI is allowed to see (never passwords, never emails). */
export type DirectoryEntry = {
  code: string;
  name: string;
  role: Role;
  specialization: string;
  skills: string;
};

export type ValidationIssue = { path: string; message: string };

export type ResolvedTask = {
  title: string;
  description: string;
  assigneeId: string; // resolved user code (the caller maps code -> DB id)
  deadline: Date;
  estimatedHours: number;
};

export type ResolvedProject = {
  name: string;
  clientName: string;
  description: string;
  managerId: string; // resolved user code (the caller maps code -> DB id)
  deadline: Date;
  tasks: ResolvedTask[];
};

export type ValidationResult =
  | { ok: true; resolved: ResolvedProject[] }
  | { ok: false; errors: ValidationIssue[] };

const MAX_ESTIMATED_HOURS = 200;

/** Build the sanitized directory payload handed to Gemini (rule R13). */
export function toDirectory(
  users: readonly {
    code: string;
    name: string;
    role: Role;
    specialization: string;
    skills: string;
  }[],
): DirectoryEntry[] {
  return users.map((user) => ({
    code: user.code,
    name: user.name,
    role: user.role,
    specialization: user.specialization,
    skills: user.skills,
  }));
}

function parseIsoDate(value: string): Date | null {
  if (!ISO_DATE.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

/**
 * Resolve codes to database ids and check every semantic rule.
 * Collects ALL problems instead of bailing on the first one — the UI lists them all.
 */
export function resolveAndValidate(
  draft: Extraction,
  directory: readonly DirectoryEntry[],
): ValidationResult {
  const errors: ValidationIssue[] = [];
  const byCode = new Map(directory.map((entry) => [entry.code.toUpperCase(), entry]));

  const resolved: ResolvedProject[] = [];
  const seenProjectNames = new Map<string, number>();

  draft.projects.forEach((project, projectIndex) => {
    const projectPath = `projects[${projectIndex}]`;

    const manager = byCode.get(project.managerId.trim().toUpperCase());
    let managerId: string | null = null;
    if (!manager) {
      errors.push({
        path: `${projectPath}.managerId`,
        message: `"${project.managerId}" does not match any user in the directory.`,
      });
    } else if (manager.role !== "MANAGER") {
      errors.push({
        path: `${projectPath}.managerId`,
        message: `"${manager.code}" is a ${manager.role}, not a MANAGER.`,
      });
    } else {
      managerId = manager.code;
    }

    const projectDeadline = parseIsoDate(project.deadline);
    if (!projectDeadline) {
      errors.push({
        path: `${projectPath}.deadline`,
        message: `"${project.deadline}" is not a valid calendar date (YYYY-MM-DD).`,
      });
    }

    const normalizedName = project.name.trim().toLowerCase();
    const previousIndex = seenProjectNames.get(normalizedName);
    if (previousIndex !== undefined) {
      errors.push({
        path: `${projectPath}.name`,
        message: `Duplicate project name "${project.name}" — also used by projects[${previousIndex}].`,
      });
    } else {
      seenProjectNames.set(normalizedName, projectIndex);
    }

    const resolvedTasks: ResolvedTask[] = [];

    project.tasks.forEach((task, taskIndex) => {
      const taskPath = `${projectPath}.tasks[${taskIndex}]`;

      const assignee = byCode.get(task.assignedId.trim().toUpperCase());
      let assigneeId: string | null = null;
      if (!assignee) {
        errors.push({
          path: `${taskPath}.assignedId`,
          message: `"${task.assignedId}" does not match any user in the directory.`,
        });
      } else if (assignee.role !== "AGENT") {
        errors.push({
          path: `${taskPath}.assignedId`,
          message: `"${assignee.code}" is a ${assignee.role}, not an AGENT.`,
        });
      } else {
        assigneeId = assignee.code;
      }

      const taskDeadline = parseIsoDate(task.deadline);
      if (!taskDeadline) {
        errors.push({
          path: `${taskPath}.deadline`,
          message: `"${task.deadline}" is not a valid calendar date (YYYY-MM-DD).`,
        });
      } else if (projectDeadline && taskDeadline.getTime() > projectDeadline.getTime()) {
        errors.push({
          path: `${taskPath}.deadline`,
          message: `Task deadline ${task.deadline} is after project deadline ${project.deadline}.`,
        });
      }

      if (task.estimatedHours > MAX_ESTIMATED_HOURS) {
        errors.push({
          path: `${taskPath}.estimatedHours`,
          message: `${task.estimatedHours} h exceeds the ${MAX_ESTIMATED_HOURS} h sanity cap.`,
        });
      }

      if (assigneeId && taskDeadline) {
        resolvedTasks.push({
          title: task.title.trim(),
          description: task.description.trim(),
          assigneeId,
          deadline: taskDeadline,
          estimatedHours: task.estimatedHours,
        });
      }
    });

    if (managerId && projectDeadline && resolvedTasks.length === project.tasks.length) {
      resolved.push({
        name: project.name.trim(),
        clientName: project.clientName.trim(),
        description: project.description.trim(),
        managerId,
        deadline: projectDeadline,
        tasks: resolvedTasks,
      });
    }
  });

  if (errors.length > 0) return { ok: false, errors };

  return { ok: true, resolved };
}
