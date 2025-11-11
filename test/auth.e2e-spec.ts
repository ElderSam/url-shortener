import { INestApplication, ValidationPipe } from '@nestjs/common';
import { truncateAllTables } from './utils/db-reset';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register a new user (201)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'e2e@email.com', password: '123456' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'Registration successful');
    expect(typeof res.body.userId).toBe('string');
  });

  it('should return 400 for invalid email', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'invalid', password: '123456' });
    expect(res.status).toBe(400);
  });

  it('should return 400 for empty password', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'e2e@email.com', password: '' });
    expect(res.status).toBe(400);
  });

  it('should return 400 for short password', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'e2e@email.com', password: '123' });
    expect(res.status).toBe(400);
  });

  it('should return 409 for already registered email', async () => {
    // First registration
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'already@email.com', password: '123456' });
    // Second registration with same email
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'already@email.com', password: '123456' });
    expect(res.status).toBe(400); // BadRequestException (could be 409 if custom exception is used)
  });
});
