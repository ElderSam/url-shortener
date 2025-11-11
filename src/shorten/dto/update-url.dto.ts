import { Transform } from 'class-transformer';
import { IsString, IsUrl, MinLength, MaxLength } from 'class-validator';

export class UpdateUrlDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsUrl({ require_protocol: true }, { message: 'URL must be valid and include http:// or https://' })
  @MinLength(5)
  @MaxLength(2048)
  originalUrl: string;
}
