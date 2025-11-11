import { Injectable, BadRequestException } from '@nestjs/common';
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
    // If alias is provided, validate uniqueness, regex, and reserved routes
    if (dto.alias) {
      // Regex: ^[a-z0-9_-]{3,30}$
      if (!/^[a-z0-9_-]{3,30}$/i.test(dto.alias)) {
        throw new BadRequestException('Alias must be 3-30 chars, [a-z0-9_-]');
      }
      // Reserved routes
      const reserved = ['auth', 'docs', 'api', 'shorten', 'my-urls'];
      if (reserved.includes(dto.alias.toLowerCase())) {
        throw new BadRequestException('Alias is a reserved route');
      }
      const aliasExists = await this.prisma.shortUrl.findUnique({ where: { alias: dto.alias } });
      if (aliasExists) {
        throw new BadRequestException('Alias already in use');
      }
      alias = dto.alias;
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
    // Return public identifier (alias if present, else slug)
    return {
      id: shortUrl.id,
      originalUrl: shortUrl.originalUrl,
      short: alias ?? slug,
      ownerId: shortUrl.ownerId,
      // accessCount: shortUrl.accessCount,
      createdAt: shortUrl.createdAt,
      // updatedAt: shortUrl.updatedAt,
    };
  }
}
