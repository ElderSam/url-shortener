import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {

  register(registerDto: RegisterDto) {
    // TODO: Implementar lógica de registro
    return { message: 'Registro realizado', registerDto };
  }
}
