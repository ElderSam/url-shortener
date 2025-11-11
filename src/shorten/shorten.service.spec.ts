import { Test, TestingModule } from '@nestjs/testing';
import { ShortenService } from './shorten.service';

describe('ShortenService', () => {
  let service: ShortenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShortenService],
    }).compile();

    service = module.get<ShortenService>(ShortenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
