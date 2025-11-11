import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function truncateAllTables() {
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "User" RESTART IDENTITY CASCADE');
  // Add more tables here as needed
}
