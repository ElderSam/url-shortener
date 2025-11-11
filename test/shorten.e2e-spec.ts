import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('POST /shorten (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    // Add global pipes and interceptors as in main.ts
    const { ValidationPipe } = require('@nestjs/common');
    const { ResponseInterceptor } = require('../src/common/interceptors/response.interceptor');
    const { GlobalExceptionFilter } = require('../src/common/filters/global-exception.filter');
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
    }));
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  beforeEach(async () => {
    // Clean up ShortUrl table before each test
    const { PrismaService } = require('../src/prisma/prisma.service');
    const prisma = app.get(PrismaService);
    await prisma.prismaClient.shortUrl.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a short url (anonymous)', async () => {
    const res = await request(app.getHttpServer())
      .post('/shorten')
      .send({ originalUrl: 'http://example.com' });
    expect(res.status).toBe(201);
    expect(res.body.short).toMatch(/^[A-Za-z0-9]{6}$/);
    expect(res.body.originalUrl).toBe('http://example.com');
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
    const password = 'test123';
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });

    const token = loginRes.body.access_token || loginRes.body.accessToken;
    expect(token).toBeDefined();

    const res = await request(app.getHttpServer())
      .post('/shorten')
      .set('Authorization', `Bearer ${token}`)
      .send({ originalUrl: 'http://example.com', alias: 'myalias' });

    expect(res.status).toBe(201);
    expect(res.body.short).toBe('myalias');
    expect(res.body.ownerId).toBeDefined();
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
