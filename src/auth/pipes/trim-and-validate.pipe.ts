import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { RegisterDto } from '../dto/register.dto';

@Injectable()
export class TrimAndValidatePipe implements PipeTransform {
  transform(value: RegisterDto) {
    // Only trim email and password
    if (typeof value.email === 'string') {
      value.email = value.email.trim();
    }
    if (typeof value.password === 'string') {
      value.password = value.password.trim();
    }
    return value;
  }
}
