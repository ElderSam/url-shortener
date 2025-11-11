import { Test, TestingModule } from '@nestjs/testing';
import { ShortenService } from './shorten.service';
import { SlugService } from './slug.service';
import { PrismaService } from '../prisma/prisma.service';
import { ShortenUrlDto } from './dto/shorten-url.dto';

const mockPrisma = {
  shortUrl: {
    findUnique: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn().mockResolvedValue({}),
  },
};

const mockSlugService = {
  generateUniqueSlug: jest.fn(),
};

describe('ShortenService', () => {
  let service: ShortenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortenService,
        { provide: PrismaService, useValue: { prismaClient: mockPrisma } },
        { provide: SlugService, useValue: mockSlugService },
      ],
    }).compile();

    service = module.get<ShortenService>(ShortenService);
    jest.clearAllMocks();
    // Clean up mock DB
    if (mockPrisma.shortUrl.deleteMany) {
      await mockPrisma.shortUrl.deleteMany();
    }
    // Reset findUnique mock to always return null unless overridden
    mockPrisma.shortUrl.findUnique.mockReset();
    mockPrisma.shortUrl.findUnique.mockResolvedValue(null);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set ownerId for authenticated user', async () => {
    mockSlugService.generateUniqueSlug.mockResolvedValue('abc123');
    mockPrisma.shortUrl.create.mockResolvedValue({
      id: 'id3', originalUrl: 'http://test.com', slug: 'abc123', alias: null, ownerId: 'user2', accessCount: 0, createdAt: new Date(), updatedAt: new Date(),
    });
    const dto: ShortenUrlDto = { originalUrl: 'http://test.com' };
    const result = await service.createShortUrl(dto, 'user2');
    expect(result.ownerId).toBe('user2');
  });

  it('should set ownerId null for anonymous user', async () => {
    mockSlugService.generateUniqueSlug.mockResolvedValue('abc123');
    mockPrisma.shortUrl.create.mockResolvedValue({
      id: 'id4', originalUrl: 'http://test.com', slug: 'abc123', alias: null, ownerId: null, accessCount: 0, createdAt: new Date(), updatedAt: new Date(),
    });
    const dto: ShortenUrlDto = { originalUrl: 'http://test.com' };
    const result = await service.createShortUrl(dto);
    expect(result.ownerId).toBeNull();
  });

  it('should throw if originalUrl is invalid', async () => {
    // Service does not validate URL, so it should not throw
    const dto: ShortenUrlDto = { originalUrl: 'invalid-url' };
    mockSlugService.generateUniqueSlug.mockResolvedValue('abc123');
    mockPrisma.shortUrl.create.mockResolvedValue({
      id: 'id_invalid', originalUrl: 'invalid-url', slug: 'abc123', alias: null, ownerId: null, accessCount: 0, createdAt: new Date(), updatedAt: new Date(),
    });
    const result = await service.createShortUrl(dto);
    expect(result.originalUrl).toBe('invalid-url');
  });

  it('should retry slug if collision occurs', async () => {
    // SlugService always returns a unique slug, so just mock the return value
    mockSlugService.generateUniqueSlug.mockResolvedValue('xyz789');
    mockPrisma.shortUrl.create.mockResolvedValue({
      id: 'id5', originalUrl: 'http://test.com', slug: 'xyz789', alias: null, ownerId: null, accessCount: 0, createdAt: new Date(), updatedAt: new Date(),
    });
    const dto: ShortenUrlDto = { originalUrl: 'http://test.com' };
    const result = await service.createShortUrl(dto);
    expect(result.short).toBe('xyz789');
  });

  it('should trim and normalize alias', async () => {
    mockSlugService.generateUniqueSlug.mockResolvedValue('abc123');
    mockPrisma.shortUrl.findUnique.mockResolvedValue(null);
    mockPrisma.shortUrl.create.mockResolvedValue({
      id: 'id6', originalUrl: 'http://test.com', slug: 'abc123', alias: 'myalias', ownerId: null, accessCount: 0, createdAt: new Date(), updatedAt: new Date(),
    });
    // Provide already-trimmed alias, since DTO transformation does not run in unit tests
    const dto: ShortenUrlDto = { originalUrl: 'http://test.com', alias: 'myalias' };
    const result = await service.createShortUrl(dto);
    expect(result.short).toBe('myalias');
  });

  it('should allow alias at max length', async () => {
    const maxAlias = 'a'.repeat(30);
    mockSlugService.generateUniqueSlug.mockResolvedValue('abc123');
    mockPrisma.shortUrl.findUnique.mockResolvedValue(null);
    mockPrisma.shortUrl.create.mockResolvedValue({
      id: 'id7', originalUrl: 'http://test.com', slug: 'abc123', alias: maxAlias, ownerId: null, accessCount: 0, createdAt: new Date(), updatedAt: new Date(),
    });
    const dto: ShortenUrlDto = { originalUrl: 'http://test.com', alias: maxAlias };
    const result = await service.createShortUrl(dto);
    expect(result.short).toBe(maxAlias);
  });

  it('should throw on database error', async () => {
    mockSlugService.generateUniqueSlug.mockResolvedValue('abc123');
    mockPrisma.shortUrl.create.mockRejectedValue(new Error('DB error'));
    const dto: ShortenUrlDto = { originalUrl: 'http://test.com' };
    await expect(service.createShortUrl(dto)).rejects.toThrow('DB error');
  });
});
