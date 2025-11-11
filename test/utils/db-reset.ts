import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function truncateAllTables() {
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "ShortUrl", "User" RESTART IDENTITY CASCADE');
  await prisma.$disconnect(); // Ensure connection is closed after truncation
}