import { INestApplication, ValidationPipe } from '@nestjs/common';
import { truncateAllTables } from './utils/db-reset';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { attempts, globalAttempts } from '../src/auth/guards/rate-limit.guard';

describe('AuthController (login e2e)', () => {
  let app: INestApplication;
  const testUser = { email: 'login-e2e@email.com', password: 'password123' };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  beforeEach(async () => {
    await truncateAllTables();
    // Reset rate limiting attempts for test isolation
    for (const key in attempts) {
      delete attempts[key];
    }
    for (const key in globalAttempts) {
      delete globalAttempts[key];
    }
    // Register user for login tests
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should login successfully and return JWT', async () => {
    // User is registered in beforeEach
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(testUser);

    expect([200, 201]).toContain(res.status); // Accept 200 or 201 for login
    expect(res.body.data).toHaveProperty('accessToken');
    expect(typeof res.body.data.accessToken).toBe('string');
  });

  it('should return 400 for invalid email', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'wrong@email.com', password: testUser.password });
    expect(res.status).toBe(400);
    expect(res.body).not.toHaveProperty('accessToken');
  });

  it('should return 400 for wrong password', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: 'wrongpass' });
    expect(res.status).toBe(400);
    expect(res.body).not.toHaveProperty('accessToken');
  });

  it('should return 400 for empty email', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: '', password: testUser.password });
    expect(res.status).toBe(400);
  });

  it('should return 400 for empty password', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: '' });
    expect(res.status).toBe(400);
  });

  it('should enforce rate limiting on login', async () => {
    // Assuming limit is 5 attempts per IP (adjust if needed)
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'wrong@email.com', password: 'wrongpass' });
    }
    // 6th attempt should be blocked
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'wrong@email.com', password: 'wrongpass' });
    expect(res.status).toBe(400); // BadRequestException for rate limit
    expect(res.body.message).toMatch(/Too many login attempts/i);
  });
});
