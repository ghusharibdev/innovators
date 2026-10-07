import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/** Minimal shape needed for scoping decisions. */
export type SessionUser = {
  id: string;
  role: "ADMIN" | "MANAGER" | "AGENT";
};

export const PROJECT_INCLUDE = {
  manager: {
    select: { id: true, name: true, code: true, specialization: true },
  },
  tasks: {
    orderBy: { deadline: "asc" },
    include: {
      assignee: {
        select: { id: true, name: true, code: true, specialization: true },
      },
    },
  },
} satisfies Prisma.ProjectInclude;

export type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: typeof PROJECT_INCLUDE;
}>;

export type TaskWithAssignee = ProjectWithRelations["tasks"][number];

/** Projects the user is allowed to see. */
export async function getVisibleProjects(
  user: SessionUser,
): Promise<ProjectWithRelations[]> {
  if (user.role === "ADMIN") {
    return prisma.project.findMany({
      orderBy: { createdAt: "asc" },
      include: PROJECT_INCLUDE,
    });
  }

  if (user.role === "MANAGER") {
    return prisma.project.findMany({
      where: { managerId: user.id },
      orderBy: { createdAt: "asc" },
      include: PROJECT_INCLUDE,
    });
  }

  // AGENT: distinct projects that contain at least one task assigned to them.
  return prisma.project.findMany({
    where: { tasks: { some: { assigneeId: user.id } } },
    orderBy: { createdAt: "asc" },
    include: PROJECT_INCLUDE,
  });
}

/**
 * A single project, or null if it is outside the user's scope.
 * Agents only ever receive their own tasks inside the project.
 */
export async function getProjectForUser(
  user: SessionUser,
  projectId: string,
): Promise<ProjectWithRelations | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: PROJECT_INCLUDE,
  });
  if (!project) return null;

  if (user.role === "ADMIN") return project;

  if (user.role === "MANAGER") return project.managerId === user.id ? project : null;

  const mine = project.tasks.some((task) => task.assigneeId === user.id);
  if (!mine) return null;

  return { ...project, tasks: project.tasks.filter((task) => task.assigneeId === user.id) };
}

/** Tasks assigned to an agent, across all projects, soonest deadline first. */
export async function getTasksForAgent(userId: string) {
  return prisma.task.findMany({
    where: { assigneeId: userId },
    orderBy: { deadline: "asc" },
    include: {
      project: {
        select: { id: true, name: true, clientName: true, deadline: true },
      },
    },
  });
}

export type AgentTask = Awaited<ReturnType<typeof getTasksForAgent>>[number];

/** All tasks visible to a manager (inside their projects) or admin (everything). */
export async function getTasksForManager(managerId: string) {
  return prisma.task.findMany({
    where: { project: { managerId } },
    orderBy: { deadline: "asc" },
    include: {
      project: {
        select: { id: true, name: true, clientName: true, deadline: true },
      },
      assignee: { select: { id: true, name: true, code: true } },
    },
  });
}

export async function getAllTasks() {
  return prisma.task.findMany({
    orderBy: { deadline: "asc" },
    include: {
      project: {
        select: { id: true, name: true, clientName: true, deadline: true },
      },
      assignee: { select: { id: true, name: true, code: true } },
    },
  });
}

/** Role-aware task list for GET /api/tasks. */
export async function getVisibleTasks(user: SessionUser) {
  if (user.role === "ADMIN") return getAllTasks();
  if (user.role === "MANAGER") return getTasksForManager(user.id);
  return getTasksForAgent(user.id);
}

/** Read-only company directory — never includes passwordHash or email. */
export async function getDirectory() {
  return prisma.user.findMany({
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
}
