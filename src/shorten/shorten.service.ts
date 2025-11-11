import { Injectable } from '@nestjs/common';
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
    // If alias is provided, validate uniqueness and regex
    if (dto.alias) {
      const aliasExists = await this.prisma.shortUrl.findUnique({ where: { alias: dto.alias } });
      if (aliasExists) {
        throw new Error('Alias already in use');
      }
      // Regex: ^[a-z0-9_-]{3,30}$
      if (!/^[a-z0-9_-]{3,30}$/i.test(dto.alias)) {
        throw new Error('Alias must be 3-30 chars, [a-z0-9_-]');
      }
    }

    // Generate unique slug
    const slug = await this.slugService.generateUniqueSlug();

    // Persist to database
    const shortUrl = await this.prisma.shortUrl.create({
      data: {
        originalUrl: dto.originalUrl,
        slug,
        alias: dto.alias ?? null,
        ownerId: ownerId ?? null,
      },
    });
    return shortUrl;
  }
}
