import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { AppModule } from '../src/app.module';

describe('POST /shorten (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
    }));

    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  beforeEach(async () => {
  // Clean up all tables before each test
  const { truncateAllTables } = require('./utils/db-reset');
  await truncateAllTables();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a short url (anonymous)', async () => {
    const res = await request(app.getHttpServer())
      .post('/shorten')
      .send({ originalUrl: 'http://example.com' });


  expect(res.status).toBe(201);
  expect(res.body.data.shortUrl).toMatch(/^http:\/\/localhost:3000\/[A-Za-z0-9_-]{6}$/);
  expect(res.body.data.ownerId).toBeNull();
  });

  it('should fail with invalid url', async () => {
    const res = await request(app.getHttpServer())
      .post('/shorten')
      .send({ originalUrl: 'invalid-url' });
    expect(res.status).toBe(400);
  });

  it('should create a short url with alias (authenticated)', async () => {
    // First, register and login to get JWT
    const email = `user${Date.now()}@test.com`;
    const password = 'password123';
    const uniqueAlias = `myalias-${Date.now()}`;

    // Register user before login
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password });
    expect(registerRes.status).toBe(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });
    expect(loginRes.status).toBe(200);

    const token = loginRes.body.data?.data?.accessToken || loginRes.body.data?.accessToken || loginRes.body.data?.access_token;
    expect(token).toBeDefined();

    const res = await request(app.getHttpServer())
      .post('/shorten')
      .set('Authorization', `Bearer ${token}`)
      .send({ originalUrl: 'http://example.com', alias: uniqueAlias });

    expect(res.status).toBe(201);
    expect(res.body.data.shortUrl).toBe(`http://localhost:3000/${uniqueAlias}`);
    expect(res.body.data.ownerId).toBeDefined();
  });

  it('should fail with duplicate alias', async () => {
    // Create first alias
    const firstRes = await request(app.getHttpServer())
      .post('/shorten')
      .send({ originalUrl: 'http://example.com', alias: 'uniquealias' });
    expect(firstRes.status).toBe(201);

    // Try to create again
    const res = await request(app.getHttpServer())
      .post('/shorten')
      .send({ originalUrl: 'http://example.com', alias: 'uniquealias' });

    expect(res.status).toBe(400);
  });

  it('should fail with reserved alias', async () => {
    const res = await request(app.getHttpServer())
      .post('/shorten')
      .send({ originalUrl: 'http://example.com', alias: 'auth' });

    expect(res.status).toBe(400);
  });

  it('should fail with invalid bearer token', async () => {
    const res = await request(app.getHttpServer())
      .post('/shorten')
      .set('Authorization', 'Bearer invalidtoken')
      .send({ originalUrl: 'http://example.com' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid or expired token/i);
  });
});
