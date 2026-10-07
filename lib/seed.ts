import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { DEMO_PASSWORD, DEMO_USERS } from "@/lib/seed-data";

export type SeedSummary = {
  created: number;
  updated: number;
  totalUsers: number;
};

/**
 * Idempotent seeding — upsert by `code`, hash the password only on create.
 * Re-running never duplicates users (rule R12).
 */
export async function seedDemoUsers(): Promise<SeedSummary> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  let created = 0;
  let updated = 0;

  for (const user of DEMO_USERS) {
    const existing = await prisma.user.findUnique({
      where: { code: user.code },
      select: { id: true },
    });

    await prisma.user.upsert({
      where: { code: user.code },
      update: {
        name: user.name,
        email: user.email,
        role: user.role,
        specialization: user.specialization,
        skills: user.skills,
      },
      create: {
        code: user.code,
        name: user.name,
        email: user.email,
        role: user.role,
        specialization: user.specialization,
        skills: user.skills,
        passwordHash,
      },
    });

    if (existing) updated += 1;
    else created += 1;
  }

  const totalUsers = await prisma.user.count();

  return { created, updated, totalUsers };
}
