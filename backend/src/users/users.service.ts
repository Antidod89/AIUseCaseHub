import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import * as bcrypt from 'bcrypt';
import { AppRole } from '../common/constants/role.enum';

// Сервис управления пользователями
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role || AppRole.USER
      }
    });
  }

  async updateRole(id: number, dto: UpdateUserRoleDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return this.prisma.user.update({
      where: { id },
      data: { role: dto.role }
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}

