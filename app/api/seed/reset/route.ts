import { NextResponse } from "next/server";
import { AuthError, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(): Promise<NextResponse> {
  try {
    await requireAdmin();

    const [tasks, projects] = await prisma.$transaction([
      prisma.task.deleteMany({}),
      prisma.project.deleteMany({}),
    ]);

    return NextResponse.json(
      {
        ok: true,
        deleted: { tasks: tasks.count, projects: projects.count },
        usersKept: await prisma.user.count(),
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST /api/seed/reset failed:", error);
    return NextResponse.json({ error: "Reset failed." }, { status: 500 });
  }
}
