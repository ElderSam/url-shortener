import { execSync } from 'child_process';

const testDbUrl = process.env.DATABASE_URL_TEST;

if (!testDbUrl) {
  console.error('❌ DATABASE_URL_TEST not found in .env');
  process.exit(1);
}

console.log('🔧 Creating test database schema...');

try {
  // Extract database name from URL
  const dbName = testDbUrl.split('/').pop()?.split('?')[0];
  console.log(`📊 Target database: ${dbName}`);
  
  // Run migrations on test database
  execSync(`DATABASE_URL="${testDbUrl}" npx prisma migrate deploy`, {
    stdio: 'inherit',
  });
  
  console.log('✅ Test database ready!');
} catch (error) {
  console.error('❌ Failed to setup test database:', error);
  process.exit(1);
}
