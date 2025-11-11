import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ShortenModule } from './shorten/shorten.module';

@Module({
  imports: [PrismaModule, AuthModule, ShortenModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
