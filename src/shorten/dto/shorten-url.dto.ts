import { IsString, IsOptional, Matches, IsUrl, MinLength, MaxLength } from 'class-validator';

export class ShortenUrlDto {
  @IsString()
  @IsUrl({ require_protocol: true }, { message: 'URL must be valid and include http:// or https://' })
  @MinLength(5)
  @MaxLength(2048)
  originalUrl: string;

  @IsOptional()
  @Matches(/^[a-z0-9_-]{3,30}$/i, { message: 'Alias must be 3-30 chars, [a-z0-9_-], case-insensitive' })
  alias?: string;
}
