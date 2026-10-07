import { loadEnv } from "../lib/load-env";

loadEnv();

import { prisma } from "../lib/db";
import { seedDemoUsers } from "../lib/seed";
import { DEMO_PASSWORD } from "../lib/seed-data";

async function main(): Promise<void> {
  const summary = await seedDemoUsers();

  const admins = await prisma.user.count({ where: { role: "ADMIN" } });
  const managers = await prisma.user.count({ where: { role: "MANAGER" } });
  const agents = await prisma.user.count({ where: { role: "AGENT" } });

  console.log("✅ Seed complete — re-running never duplicates (upsert by code).");
  console.log(
    `   created: ${summary.created} · updated: ${summary.updated} · total users: ${summary.totalUsers}`,
  );
  console.log(`   ${admins} admin · ${managers} managers · ${agents} agents`);
  console.log(`   demo password for every account: ${DEMO_PASSWORD}`);
}

main()
  .catch((error: unknown) => {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
