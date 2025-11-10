import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto, examples: {
    default: {
      summary: 'Example',
      value: { email: 'user@email.com', password: 'password123' }
    }
  }})
  @ApiResponse({ status: 201, description: 'User registered successfully', schema: {
    example: { message: 'Registro realizado', user: { id: 'uuid', email: 'user@email.com' } }
  }})
  @ApiResponse({ status: 400, description: 'Validation error', schema: {
    example: { statusCode: 400, message: 'Email é obrigatório', error: 'Bad Request' }
  }})
  @ApiResponse({ status: 409, description: 'Email already registered', schema: {
    example: { statusCode: 409, message: 'Email já cadastrado', error: 'Conflict' }
  }})
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
