import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService - login', () => {
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should login successfully with valid credentials', async () => {
    const dto: LoginDto = { email: 'user@email.com', password: 'password123' };
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    (usersService.findByEmail as jest.Mock).mockResolvedValue({ id: 'user-id', email: dto.email, password: hashedPassword });
    const result = await authService.login(dto);
    expect(result).toHaveProperty('accessToken');
    expect(typeof result.accessToken).toBe('string');
  });

  it('should throw BadRequestException for invalid email', async () => {
    const dto: LoginDto = { email: 'notfound@email.com', password: 'password123' };
    (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
    await expect(authService.login(dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException for wrong password', async () => {
    const dto: LoginDto = { email: 'user@email.com', password: 'wrongpass' };
    const hashedPassword = await bcrypt.hash('password123', 10);
    (usersService.findByEmail as jest.Mock).mockResolvedValue({ id: 'user-id', email: dto.email, password: hashedPassword });
    await expect(authService.login(dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw error for empty email', async () => {
    const dto: LoginDto = { email: '', password: 'password123' };
    (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
    await expect(authService.login(dto)).rejects.toThrow();
  });

  it('should throw error for empty password', async () => {
    const dto: LoginDto = { email: 'user@email.com', password: '' };
    (usersService.findByEmail as jest.Mock).mockResolvedValue({ id: 'user-id', email: dto.email, password: 'irrelevant' });
    await expect(authService.login(dto)).rejects.toThrow();
  });
});
