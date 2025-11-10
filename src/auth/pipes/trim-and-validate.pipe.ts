import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { RegisterDto } from '../dto/register.dto';

const isTypeString = (val: unknown) => val == 'string';

@Injectable()
export class TrimAndValidatePipe implements PipeTransform {
  transform(value: RegisterDto) {
    let { email, password } = value;

    // Trim email and password
    email = isTypeString(email) ? email.trim() : email;
    password = isTypeString(password) ? password.trim() : password;

    // Validate email
    if (!email || !isTypeString(email) || !email.trim()) {
      throw new BadRequestException('Email is required');
    }
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }
    // Validate password
    if (!password || !isTypeString(password) || !password.trim()) {
      throw new BadRequestException('Password is required');
    }
    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }
    return value;
  }
}
