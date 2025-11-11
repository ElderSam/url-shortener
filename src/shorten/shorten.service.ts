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
}
