import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
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

  it('should register a new user successfully', async () => {
    const dto: RegisterDto = { email: 'test@email.com', password: '123456' };
    (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
    const fakeUuid = 'a1b2c3d4-e5f6-7890-abcd-1234567890ab';
    (usersService.create as jest.Mock).mockImplementation(async (user) => ({ id: fakeUuid, email: user.email }));

    const result = await authService.register(dto);
    expect(result).toEqual({ message: 'Registro realizado', userId: fakeUuid });
    expect(typeof result.userId).toBe('string');
    expect(usersService.create).toHaveBeenCalledWith({ email: 'test@email.com', password: expect.any(String) });
  });

  it('should throw error for empty email', async () => {
    const dto: RegisterDto = { email: '', password: '123456' };
    (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
    await expect(authService.register(dto)).rejects.toThrow();
  });

  it('should throw error for invalid email format', async () => {
    const dto: RegisterDto = { email: 'invalid-email', password: '123456' };
    (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
    await expect(authService.register(dto)).rejects.toThrow();
  });

  it('should throw BadRequestException if email already exists (409)', async () => {
    const dto: RegisterDto = { email: 'test@email.com', password: '123456' };
    (usersService.findByEmail as jest.Mock).mockResolvedValue({ id: 1, email: 'test@email.com' });
    await expect(authService.register(dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw error for empty password', async () => {
    const dto: RegisterDto = { email: 'test@email.com', password: '' };
    (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
    await expect(authService.register(dto)).rejects.toThrow();
  });

  it('should throw error for short password', async () => {
    const dto: RegisterDto = { email: 'test@email.com', password: '123' };
    (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
    await expect(authService.register(dto)).rejects.toThrow();
  });
});
