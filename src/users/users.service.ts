import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClient, Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

@Injectable()
export class UsersService {
  public prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;

	constructor(private readonly prismaService: PrismaService) {
    this.prisma = this.prismaService.prismaClient;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(user: { email: string; password: string }) {
    return this.prisma.user.create({ data: user });
  }
}
