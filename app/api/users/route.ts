import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth";
import { getDirectory } from "@/lib/access";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    await requireUser();
    const users = await getDirectory();
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET /api/users failed:", error);
    return NextResponse.json({ error: "Could not load the directory." }, { status: 500 });
  }
}
