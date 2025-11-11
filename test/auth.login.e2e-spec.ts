import { INestApplication, ValidationPipe } from '@nestjs/common';
import { truncateAllTables } from './utils/db-reset';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

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
    // Register user for login tests
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should login successfully and return JWT', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(testUser);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(typeof res.body.accessToken).toBe('string');
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
