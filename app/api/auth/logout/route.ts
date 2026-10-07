import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(): Promise<NextResponse> {
  try {
    await destroySession();
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("POST /api/auth/logout failed:", error);
    return NextResponse.json(
      { error: "Something went wrong while signing out." },
      { status: 500 },
    );
  }
}
