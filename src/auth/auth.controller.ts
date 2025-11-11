import { Controller, Post, Body, ValidationPipe, UseGuards, ConflictException } from '@nestjs/common';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      const result = await this.authService.register(registerDto);
      return result;
    } catch (err) {
      if (err?.status === 409 && err?.message === 'Email already registered') {
        throw new ConflictException('Email already registered');
      }
      throw err;
    }
  }

  @Post('login')
  @UseGuards(RateLimitGuard)
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      data: result,
      message: 'Login successful',
    };
  }
}
