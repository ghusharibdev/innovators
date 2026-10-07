import { loadEnv } from "../lib/load-env";

loadEnv();

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const tasks = await prisma.task.deleteMany({});
  const projects = await prisma.project.deleteMany({});
  const users = await prisma.user.count();

  console.log("🧹 Generated data cleared — demo users are never deleted.");
  console.log(`   deleted tasks: ${tasks.count} · deleted projects: ${projects.count}`);
  console.log(`   users kept: ${users}`);
}

main()
  .catch((error: unknown) => {
    console.error("❌ Reset failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
