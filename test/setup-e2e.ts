// Setup for E2E tests - runs before all tests

// Load environment variables
import { config } from 'dotenv';
config();

// Force use of test database from DATABASE_URL_TEST
if (!process.env.DATABASE_URL_TEST) {
  throw new Error('⚠️ DATABASE_URL_TEST is not defined in .env file!');
}

process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;

// Use test JWT secret
process.env.JWT_SECRET = 'test-jwt-secret';

// Set test environment
process.env.NODE_ENV = 'test';

console.log('🧪 Test environment configured');
console.log('📊 Using test database:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')); // Hide password in logs
