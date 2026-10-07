import { NextResponse } from "next/server";
import { AuthError, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { seedDemoUsers } from "@/lib/seed";

export const runtime = "nodejs";

export async function POST(): Promise<NextResponse> {
  try {
    const existingUsers = await prisma.user.count();

    // First-run bootstrap stays open so a fresh deployment can be seeded.
    // Once any user exists this endpoint is administrator-only.
    if (existingUsers > 0) {
      await requireAdmin();
    }

    const summary = await seedDemoUsers();

    return NextResponse.json({ ok: true, ...summary }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST /api/seed failed:", error);
    return NextResponse.json({ error: "Seeding failed." }, { status: 500 });
  }
}
