import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const BASE62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const SLUG_LENGTH = 6;

@Injectable()
export class SlugService {
  constructor(private readonly prisma: PrismaService) {}

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
      exists = await this.prisma.prisma.shortUrl.findUnique({ where: { slug } }) !== null;
    } while (exists);
    return slug;
  }
}
