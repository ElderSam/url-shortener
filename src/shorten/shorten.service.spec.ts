import { Test, TestingModule } from '@nestjs/testing';
import { ShortenService } from './shorten.service';
import { SlugService } from './slug.service';
import { PrismaService } from '../prisma/prisma.service';
import { ShortenUrlDto } from './dto/shorten-url.dto';

const mockPrisma = {
  shortUrl: {
    findUnique: jest.fn(),
    create: jest.fn(),
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
    const dto: ShortenUrlDto = { originalUrl: 'invalid-url' };
    await expect(service.createShortUrl(dto)).rejects.toThrow();
  });

  it('should retry slug if collision occurs', async () => {
    // First slug collides, second is unique
    mockSlugService.generateUniqueSlug
      .mockResolvedValueOnce('abc123')
      .mockResolvedValueOnce('xyz789');
    mockPrisma.shortUrl.findUnique
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce(null);
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
    const dto: ShortenUrlDto = { originalUrl: 'http://test.com', alias: '  MyAlias  ' };
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
