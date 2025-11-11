import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { SlugService } from './slug.service';
import { ShortenUrlDto } from './dto/shorten-url.dto';

@Injectable()
export class ShortenService {
  public prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;

	constructor(
		private readonly prismaService: PrismaService,
		private readonly slugService: SlugService,
	) {
    this.prisma = this.prismaService.prismaClient;
  }

  async createShortUrl(dto: ShortenUrlDto, ownerId?: string) {
    let alias: string | null = null;
    // If alias is provided, normalize to lowercase, validate uniqueness, regex, and reserved routes
    if (dto.alias) {
      const normalizedAlias = dto.alias.toLowerCase();
      // Regex: ^[a-z0-9_-]{3,30}$
      if (!/^[a-z0-9_-]{3,30}$/.test(normalizedAlias)) {
        throw new BadRequestException('Alias must be 3-30 chars, [a-z0-9_-]');
      }
      // Reserved routes
      const reserved = ['auth', 'docs', 'api', 'shorten', 'my-urls'];
      if (reserved.includes(normalizedAlias)) {
        throw new BadRequestException('Alias is a reserved route');
      }
      const aliasExists = await this.prisma.shortUrl.findUnique({ where: { alias: normalizedAlias } });
      if (aliasExists) {
        throw new BadRequestException('Alias already in use');
      }
      alias = normalizedAlias;
    }

    // Generate unique slug
    const slug = await this.slugService.generateUniqueSlug();

    // Persist to database
    const shortUrl = await this.prisma.shortUrl.create({
      data: {
        originalUrl: dto.originalUrl,
        slug,
        alias,
        ownerId: ownerId ?? null,
      },
    });
    // Build the full short URL using BASE_URL
    const baseUrl = process.env.BASE_URL || '';
    const shortPath = alias ?? slug;
    return {
      shortUrl: `${baseUrl}/${shortPath}`,
      ownerId: shortUrl.ownerId,
    };
  }

  async findAndIncrementAccess(shortCode: string): Promise<string> {
    // Find by slug or alias (case-sensitive for slug, case-insensitive for alias)
    const shortUrl = await this.prisma.shortUrl.findFirst({
      where: {
        OR: [
          { slug: shortCode },
          { alias: shortCode.toLowerCase() }
        ],
        deletedAt: null // Only active URLs
      }
    });

    if (!shortUrl) {
      throw new NotFoundException('Short URL not found');
    }

    // Increment accessCount
    await this.prisma.shortUrl.update({
      where: { id: shortUrl.id },
      data: { accessCount: { increment: 1 } }
    });

    return shortUrl.originalUrl;
  }

  async listUserUrls(userId: string) {
    const urls = await this.prisma.shortUrl.findMany({
      where: {
        ownerId: userId,
        deletedAt: null // Only active URLs
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

    // Build short URLs with BASE_URL
    const baseUrl = process.env.BASE_URL || '';
    return urls.map(url => ({
      ...url,
      shortUrl: `${baseUrl}/${url.alias ?? url.slug}`
    }));
  }

  async updateUserUrl(id: string, userId: string, newOriginalUrl: string) {
    // Find the URL and verify ownership
    const shortUrl = await this.prisma.shortUrl.findUnique({
      where: { id }
    });

    if (!shortUrl || shortUrl.deletedAt !== null) {
      throw new NotFoundException('Short URL not found');
    }

    if (shortUrl.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this URL');
    }

    // Update the originalUrl
    const updated = await this.prisma.shortUrl.update({
      where: { id },
      data: { originalUrl: newOriginalUrl },
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

    // Build short URL with BASE_URL
    const baseUrl = process.env.BASE_URL || '';
    return {
      ...updated,
      shortUrl: `${baseUrl}/${updated.alias ?? updated.slug}`
    };
  }
}
