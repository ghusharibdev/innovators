import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth";
import { getVisibleTasks } from "@/lib/access";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    const user = await requireUser();
    const tasks = await getVisibleTasks(user);
    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET /api/tasks failed:", error);
    return NextResponse.json({ error: "Could not load tasks." }, { status: 500 });
  }
}
