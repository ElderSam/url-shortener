import { PrismaClient } from '@prisma/client';

// Ensure we're using the test database
const testDatabaseUrl = process.env.DATABASE_URL_TEST;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: testDatabaseUrl,
    },
  },
});

export async function truncateAllTables() {
  console.log('🧹 Truncating test database tables...');
  await prisma.$executeRaw`TRUNCATE TABLE "ShortUrl", "User" RESTART IDENTITY CASCADE`;
  console.log('✅ Test database cleaned');
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}