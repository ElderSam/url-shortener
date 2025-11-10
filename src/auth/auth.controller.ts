import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { TrimAndValidatePipe } from './pipes/trim-and-validate.pipe';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(TrimAndValidatePipe)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
