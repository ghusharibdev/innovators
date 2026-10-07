import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth";
import { getProjectForUser } from "@/lib/access";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const user = await requireUser();
    const { id } = await context.params;

    const project = await getProjectForUser(user, id);
    if (!project) {
      return NextResponse.json(
        { error: "Project not found or you do not have access to it." },
        { status: 404 },
      );
    }

    return NextResponse.json({ project }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET /api/projects/[id] failed:", error);
    return NextResponse.json({ error: "Could not load the project." }, { status: 500 });
  }
}
