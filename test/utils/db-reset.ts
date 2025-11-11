import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function truncateAllTables() {
  await prisma.$executeRaw`TRUNCATE TABLE "ShortUrl", "User" RESTART IDENTITY CASCADE`;
}