import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';

const BASE62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const SLUG_LENGTH = 6;

@Injectable()
export class SlugService {
  public prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;

  constructor(private readonly prismaService: PrismaService) {
    this.prisma = this.prismaService.prismaClient;
  }

  private generateRandomSlug(): string {
    let slug = '';
    for (let i = 0; i < SLUG_LENGTH; i++) {
      const idx = Math.floor(Math.random() * BASE62.length);
      slug += BASE62[idx];
    }
    return slug;
  }

  async generateUniqueSlug(): Promise<string> {
    let slug: string;
    let exists = true;
    do {
      slug = this.generateRandomSlug();
      exists = await this.prisma.shortUrl.findUnique({ where: { slug } }) !== null;
    } while (exists);
    return slug;
  }
}
