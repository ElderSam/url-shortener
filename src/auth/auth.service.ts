import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    // Validação manual de email e senha
    if (!email || typeof email !== 'string' || !email.trim()) {
      throw new BadRequestException('Email é obrigatório');
    }
    if (!password || typeof password !== 'string' || !password.trim()) {
      throw new BadRequestException('Senha é obrigatória');
    }

    // Verifica se o email já está cadastrado
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email já cadastrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
    });

    return { message: 'Registro realizado', user: { id: user.id, email: user.email } };
  }
}
