import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth";
import { getVisibleProjects } from "@/lib/access";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    const user = await requireUser();
    const projects = await getVisibleProjects(user);

    const payload = projects.map((project) => ({
      id: project.id,
      name: project.name,
      clientName: project.clientName,
      description: project.description,
      deadline: project.deadline,
      manager: project.manager,
      taskCount: project.tasks.length,
      totalHours: project.tasks.reduce((sum, task) => sum + task.estimatedHours, 0),
    }));

    return NextResponse.json({ projects: payload }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET /api/projects failed:", error);
    return NextResponse.json(
      { error: "Could not load projects." },
      { status: 500 },
    );
  }
}
