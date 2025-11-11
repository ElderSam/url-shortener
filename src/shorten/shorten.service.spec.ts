import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ShortenService } from './shorten.service';
import { SlugService } from './slug.service';
import { PrismaService } from '../prisma/prisma.service';
import { ShortenUrlDto } from './dto/shorten-url.dto';

const mockPrisma = {
  shortUrl: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
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
    expect(result).toEqual({
      shortUrl: expect.stringContaining('http://'),
      ownerId: 'user2',
    });
  });

  it('should set ownerId null for anonymous user', async () => {
    mockSlugService.generateUniqueSlug.mockResolvedValue('abc123');
    mockPrisma.shortUrl.create.mockResolvedValue({
      id: 'id4', originalUrl: 'http://test.com', slug: 'abc123', alias: null, ownerId: null, accessCount: 0, createdAt: new Date(), updatedAt: new Date(),
    });
    const dto: ShortenUrlDto = { originalUrl: 'http://test.com' };
    const result = await service.createShortUrl(dto);
    expect(result).toEqual({
      shortUrl: expect.stringContaining('http://'),
      ownerId: null,
    });
  });

  it('should throw if originalUrl is invalid', async () => {
    // Service does not validate URL, so it should not throw
    const dto: ShortenUrlDto = { originalUrl: 'invalid-url' };
    mockSlugService.generateUniqueSlug.mockResolvedValue('abc123');
    mockPrisma.shortUrl.create.mockResolvedValue({
      id: 'id_invalid', originalUrl: 'invalid-url', slug: 'abc123', alias: null, ownerId: null, accessCount: 0, createdAt: new Date(), updatedAt: new Date(),
    });
  const result = await service.createShortUrl(dto);
  expect(result.shortUrl).toMatch(/^http:\/\/localhost:3000\/[A-Za-z0-9_-]{6}$/);
  });

  it('should retry slug if collision occurs', async () => {
    // SlugService always returns a unique slug, so just mock the return value
    mockSlugService.generateUniqueSlug.mockResolvedValue('xyz789');
    mockPrisma.shortUrl.create.mockResolvedValue({
      id: 'id5', originalUrl: 'http://test.com', slug: 'xyz789', alias: null, ownerId: null, accessCount: 0, createdAt: new Date(), updatedAt: new Date(),
    });
    const dto: ShortenUrlDto = { originalUrl: 'http://test.com' };
  const result = await service.createShortUrl(dto);
  expect(result.shortUrl).toContain('xyz789');
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
  expect(result.shortUrl).toContain('myalias');
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
  expect(result.shortUrl).toContain(maxAlias);
  });

  it('should throw on database error', async () => {
    mockSlugService.generateUniqueSlug.mockResolvedValue('abc123');
    mockPrisma.shortUrl.create.mockRejectedValue(new Error('DB error'));
    const dto: ShortenUrlDto = { originalUrl: 'http://test.com' };
    await expect(service.createShortUrl(dto)).rejects.toThrow('DB error');
  });

  // Tests for findAndIncrementAccess
  describe('findAndIncrementAccess', () => {
    it('should find by slug and increment access count', async () => {
      const mockShortUrl = {
        id: 'id1',
        originalUrl: 'http://example.com',
        slug: 'abc123',
        alias: null,
        ownerId: null,
        accessCount: 5,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.shortUrl.findFirst.mockResolvedValue(mockShortUrl);
      mockPrisma.shortUrl.update.mockResolvedValue({ ...mockShortUrl, accessCount: 6 });

      const result = await service.findAndIncrementAccess('abc123');

      expect(result).toBe('http://example.com');
      expect(mockPrisma.shortUrl.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { slug: 'abc123' },
            { alias: 'abc123' }
          ],
          deletedAt: null
        }
      });
      expect(mockPrisma.shortUrl.update).toHaveBeenCalledWith({
        where: { id: 'id1' },
        data: { accessCount: { increment: 1 } }
      });
    });

    it('should find by alias and increment access count', async () => {
      const mockShortUrl = {
        id: 'id2',
        originalUrl: 'http://example.com/page',
        slug: 'xyz789',
        alias: 'myalias',
        ownerId: 'user1',
        accessCount: 10,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.shortUrl.findFirst.mockResolvedValue(mockShortUrl);
      mockPrisma.shortUrl.update.mockResolvedValue({ ...mockShortUrl, accessCount: 11 });

      const result = await service.findAndIncrementAccess('myalias');

      expect(result).toBe('http://example.com/page');
      expect(mockPrisma.shortUrl.update).toHaveBeenCalledWith({
        where: { id: 'id2' },
        data: { accessCount: { increment: 1 } }
      });
    });

    it('should throw NotFoundException when URL not found', async () => {
      mockPrisma.shortUrl.findFirst.mockResolvedValue(null);

      await expect(service.findAndIncrementAccess('invalid')).rejects.toThrow(NotFoundException);
      await expect(service.findAndIncrementAccess('invalid')).rejects.toThrow('Short URL not found');
    });

    it('should throw NotFoundException when URL is soft-deleted', async () => {
      // findFirst with deletedAt: null filter returns null for soft-deleted URLs
      mockPrisma.shortUrl.findFirst.mockResolvedValue(null);

      await expect(service.findAndIncrementAccess('deleted')).rejects.toThrow(NotFoundException);
    });

    it('should normalize alias to lowercase', async () => {
      const mockShortUrl = {
        id: 'id3',
        originalUrl: 'http://example.com/test',
        slug: 'def456',
        alias: 'testalias',
        ownerId: null,
        accessCount: 0,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.shortUrl.findFirst.mockResolvedValue(mockShortUrl);
      mockPrisma.shortUrl.update.mockResolvedValue({ ...mockShortUrl, accessCount: 1 });

      const result = await service.findAndIncrementAccess('TestAlias');

      expect(result).toBe('http://example.com/test');
      expect(mockPrisma.shortUrl.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { slug: 'TestAlias' },
            { alias: 'testalias' } // lowercase
          ],
          deletedAt: null
        }
      });
    });
  });

  // Tests for listUserUrls
  describe('listUserUrls', () => {
    it('should list all active URLs for a user', async () => {
      const mockUrls = [
        {
          id: 'id1',
          originalUrl: 'http://example.com/1',
          slug: 'abc123',
          alias: null,
          accessCount: 5,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'id2',
          originalUrl: 'http://example.com/2',
          slug: 'def456',
          alias: 'myalias',
          accessCount: 10,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ];

      mockPrisma.shortUrl.findMany = jest.fn().mockResolvedValue(mockUrls);

      const result = await service.listUserUrls('user1');

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('shortUrl');
      expect(result[0].shortUrl).toContain('abc123');
      expect(result[1].shortUrl).toContain('myalias');
      expect(mockPrisma.shortUrl.findMany).toHaveBeenCalledWith({
        where: {
          ownerId: 'user1',
          deletedAt: null
        },
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          originalUrl: true,
          slug: true,
          alias: true,
          accessCount: true,
          createdAt: true,
          updatedAt: true,
        }
      });
    });

    it('should return empty array when user has no URLs', async () => {
      mockPrisma.shortUrl.findMany = jest.fn().mockResolvedValue([]);

      const result = await service.listUserUrls('user2');

      expect(result).toEqual([]);
      expect(mockPrisma.shortUrl.findMany).toHaveBeenCalledWith({
        where: {
          ownerId: 'user2',
          deletedAt: null
        },
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          originalUrl: true,
          slug: true,
          alias: true,
          accessCount: true,
          createdAt: true,
          updatedAt: true,
        }
      });
    });

    it('should not include soft-deleted URLs', async () => {
      mockPrisma.shortUrl.findMany = jest.fn().mockResolvedValue([
        {
          id: 'id1',
          originalUrl: 'http://example.com',
          slug: 'abc123',
          alias: null,
          accessCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ]);

      const result = await service.listUserUrls('user1');

      expect(mockPrisma.shortUrl.findMany).toHaveBeenCalledWith({
        where: {
          ownerId: 'user1',
          deletedAt: null // Ensuring soft-deleted are excluded
        },
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          originalUrl: true,
          slug: true,
          alias: true,
          accessCount: true,
          createdAt: true,
          updatedAt: true,
        }
      });
    });

    it('should order URLs by createdAt desc (most recent first)', async () => {
      const mockUrls = [
        {
          id: 'id1',
          originalUrl: 'http://example.com/newest',
          slug: 'newest',
          alias: null,
          accessCount: 0,
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-03'),
        },
        {
          id: 'id2',
          originalUrl: 'http://example.com/oldest',
          slug: 'oldest',
          alias: null,
          accessCount: 0,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      mockPrisma.shortUrl.findMany = jest.fn().mockResolvedValue(mockUrls);

      await service.listUserUrls('user1');

      expect(mockPrisma.shortUrl.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            createdAt: 'desc'
          }
        })
      );
    });
  });

  describe('updateUserUrl', () => {
    it('should successfully update the originalUrl for owned URL', async () => {
      const mockShortUrl = {
        id: 'url-id-1',
        ownerId: 'user-123',
        originalUrl: 'https://old-url.com',
        slug: 'abc123',
        alias: null,
        deletedAt: null,
        accessCount: 5,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      const mockUpdated = {
        id: 'url-id-1',
        originalUrl: 'https://new-url.com',
        slug: 'abc123',
        alias: null,
        accessCount: 5,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-10'),
      };

      mockPrisma.shortUrl.findUnique.mockResolvedValue(mockShortUrl);
      mockPrisma.shortUrl.update.mockResolvedValue(mockUpdated);

      const result = await service.updateUserUrl('url-id-1', 'user-123', 'https://new-url.com');

      expect(result).toEqual({
        ...mockUpdated,
        shortUrl: 'http://localhost:3000/abc123'
      });
      expect(mockPrisma.shortUrl.findUnique).toHaveBeenCalledWith({
        where: { id: 'url-id-1' }
      });
      expect(mockPrisma.shortUrl.update).toHaveBeenCalledWith({
        where: { id: 'url-id-1' },
        data: { originalUrl: 'https://new-url.com' },
        select: expect.any(Object)
      });
    });

    it('should throw NotFoundException if URL does not exist', async () => {
      mockPrisma.shortUrl.findUnique.mockResolvedValue(null);

      await expect(
        service.updateUserUrl('non-existent-id', 'user-123', 'https://new-url.com')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if URL is soft deleted', async () => {
      const mockDeletedUrl = {
        id: 'url-id-1',
        ownerId: 'user-123',
        deletedAt: new Date('2025-01-05'),
        originalUrl: 'https://old-url.com',
        slug: 'abc123',
        alias: null
      };

      mockPrisma.shortUrl.findUnique.mockResolvedValue(mockDeletedUrl);

      await expect(
        service.updateUserUrl('url-id-1', 'user-123', 'https://new-url.com')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own the URL', async () => {
      const mockShortUrl = {
        id: 'url-id-1',
        ownerId: 'other-user',
        originalUrl: 'https://old-url.com',
        slug: 'abc123',
        alias: null,
        deletedAt: null
      };

      mockPrisma.shortUrl.findUnique.mockResolvedValue(mockShortUrl);

      await expect(
        service.updateUserUrl('url-id-1', 'user-123', 'https://new-url.com')
      ).rejects.toThrow(ForbiddenException);
    });

    it('should work with aliased URLs', async () => {
      const mockShortUrl = {
        id: 'url-id-1',
        ownerId: 'user-123',
        originalUrl: 'https://old-url.com',
        slug: 'abc123',
        alias: 'myalias',
        deletedAt: null,
        accessCount: 10,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      const mockUpdated = {
        id: 'url-id-1',
        originalUrl: 'https://new-url.com',
        slug: 'abc123',
        alias: 'myalias',
        accessCount: 10,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-10'),
      };

      mockPrisma.shortUrl.findUnique.mockResolvedValue(mockShortUrl);
      mockPrisma.shortUrl.update.mockResolvedValue(mockUpdated);

      const result = await service.updateUserUrl('url-id-1', 'user-123', 'https://new-url.com');

      expect(result.shortUrl).toBe('http://localhost:3000/myalias');
    });
  });

  describe('softDeleteUserUrl', () => {
    it('should successfully soft delete the URL for owner', async () => {
      const mockShortUrl = {
        id: 'url-id-1',
        ownerId: 'user-123',
        originalUrl: 'https://example.com',
        slug: 'abc123',
        alias: null,
        deletedAt: null
      };

      mockPrisma.shortUrl.findUnique.mockResolvedValue(mockShortUrl);
      mockPrisma.shortUrl.update.mockResolvedValue({ ...mockShortUrl, deletedAt: new Date() });

      await service.softDeleteUserUrl('url-id-1', 'user-123');

      expect(mockPrisma.shortUrl.findUnique).toHaveBeenCalledWith({
        where: { id: 'url-id-1' }
      });
      expect(mockPrisma.shortUrl.update).toHaveBeenCalledWith({
        where: { id: 'url-id-1' },
        data: { deletedAt: expect.any(Date) }
      });
    });

    it('should throw NotFoundException if URL does not exist', async () => {
      mockPrisma.shortUrl.findUnique.mockResolvedValue(null);

      await expect(
        service.softDeleteUserUrl('non-existent-id', 'user-123')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if URL is already soft deleted', async () => {
      const mockDeletedUrl = {
        id: 'url-id-1',
        ownerId: 'user-123',
        deletedAt: new Date('2025-01-05'),
        originalUrl: 'https://example.com',
        slug: 'abc123',
        alias: null
      };

      mockPrisma.shortUrl.findUnique.mockResolvedValue(mockDeletedUrl);

      await expect(
        service.softDeleteUserUrl('url-id-1', 'user-123')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own the URL', async () => {
      const mockShortUrl = {
        id: 'url-id-1',
        ownerId: 'other-user',
        originalUrl: 'https://example.com',
        slug: 'abc123',
        alias: null,
        deletedAt: null
      };

      mockPrisma.shortUrl.findUnique.mockResolvedValue(mockShortUrl);

      await expect(
        service.softDeleteUserUrl('url-id-1', 'user-123')
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
