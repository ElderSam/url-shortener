import { Test, TestingModule } from '@nestjs/testing';
import { ShortenService } from './shorten.service';
import { SlugService } from './slug.service';
import { PrismaService } from '../prisma/prisma.service';

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
});
