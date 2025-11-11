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

  afterEach(async () => {
    await app.close();
  });

  it('should create a short url (anonymous)', async () => {
    const res = await request(app.getHttpServer())
      .post('/shorten')
      .send({ originalUrl: 'http://example.com' });


    expect(res.status).toBe(201);
    expect(res.body.data.short).toMatch(/^[A-Za-z0-9]{6}$/);
    expect(res.body.data.originalUrl).toBe('http://example.com');
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
    // Register user before login
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });

      // Debug log if login fails
    // if (loginRes.status !== 200) {
    //   console.error('Login failed:', loginRes.body);
    // }

  expect([200, 201]).toContain(loginRes.status);

  const token = loginRes.body.data?.data?.accessToken || loginRes.body.data?.accessToken || loginRes.body.data?.access_token;
    expect(token).toBeDefined();

    const res = await request(app.getHttpServer())
      .post('/shorten')
      .set('Authorization', `Bearer ${token}`)
      .send({ originalUrl: 'http://example.com', alias: 'myalias' });

    expect(res.status).toBe(201);
    expect(res.body.data.short).toBe('myalias');
    expect(res.body.data.ownerId).toBeDefined();
  });

  it('should fail with duplicate alias', async () => {
    // Create first alias
    await request(app.getHttpServer())
      .post('/shorten')
      .send({ originalUrl: 'http://example.com', alias: 'uniquealias' });

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
});
