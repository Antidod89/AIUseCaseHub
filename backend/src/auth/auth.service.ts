import {
  BadRequestException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AppRole } from '../common/constants/role.enum';

// Сервис аутентификации и выдачи JWT токенов
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  // Регистрация нового пользователя
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });
    if (existing) {
      throw new BadRequestException(
        'Пользователь с таким email уже существует'
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const usersCount = await this.prisma.user.count();
    const role: AppRole = usersCount === 0 ? AppRole.ADMIN : AppRole.USER;

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role
      }
    });

    return this.generateTokens(user.id, user.email, user.role);
  }

  // Логин пользователя
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  // Обновление токенов по refresh токену
  async refresh(userId: number, email: string, role: string) {
    return this.generateTokens(userId, email, role);
  }

  // Генерация access и refresh токенов
  private async generateTokens(id: number, email: string, role: string) {
    const payload = { sub: id, email, role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m'
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn:
        this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d'
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id,
        email,
        role
      }
    };
  }
}

