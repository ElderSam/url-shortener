import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async login(loginDto: import('./dto/login.dto').LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new BadRequestException('Invalid credentials');
    }
    // Generate JWT
    const jwt = await this.generateJwt(user.id, user.email);
    return { accessToken: jwt };
  }

  private async generateJwt(userId: string, email: string): Promise<string> {
  const secret = process.env.JWT_SECRET || 'changeme';
  return jwt.sign({ sub: userId, email }, secret, { expiresIn: '1h' });
  }

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    // Check if email is already registered
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
    });

    return { message: 'Registration successful', userId: user.id };
  }
}
