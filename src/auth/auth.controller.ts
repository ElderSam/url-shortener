import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import SwaggerExamples from '../swagger/examples/swagger-examples.json';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto, examples: SwaggerExamples.auth.register.request })
  @ApiResponse({ status: 201, description: 'User registered successfully', content: { 'application/json': { examples: { success: SwaggerExamples.auth.register.responses.success } } } })
  @ApiResponse({ status: 400, description: 'Validation error', content: { 'application/json': { examples: { validationError: SwaggerExamples.auth.register.responses.validationError } } } })
  @ApiResponse({ status: 409, description: 'Email already registered', content: { 'application/json': { examples: { conflictError: SwaggerExamples.auth.register.responses.conflictError } } } })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
