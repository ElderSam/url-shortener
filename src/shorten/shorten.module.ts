import { Module } from '@nestjs/common';
import { ShortenController } from './shorten.controller';
import { ShortenService } from './shorten.service';
import { SlugService } from './slug.service';

@Module({
  controllers: [ShortenController],
  providers: [ShortenService, SlugService]
})
export class ShortenModule {}
