import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

// Сервис управления доменными ролями (Role)
@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.role.findMany({
      orderBy: { id: 'asc' }
    });
  }

  findOne(id: number) {
    return this.prisma.role.findUnique({ where: { id } });
  }

  create(dto: CreateRoleDto) {
    return this.prisma.role.create({
      data: dto
    });
  }

  async update(id: number, dto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Роль не найдена');
    }
    return this.prisma.role.update({
      where: { id },
      data: dto
    });
  }

  async remove(id: number) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Роль не найдена');
    }

    // Защита от удаления базовых ролей, используемых в RBAC
    if (['ADMIN', 'EDITOR', 'USER'].includes(role.name)) {
      throw new BadRequestException('Нельзя удалить базовую системную роль');
    }

    try {
      return await this.prisma.role.delete({ where: { id } });
    } catch (e: any) {
      // P2003 - ошибка внешнего ключа (есть связанные кейсы)
      if (
        e instanceof PrismaClientKnownRequestError &&
        e.code === 'P2003'
      ) {
        throw new BadRequestException(
          'Нельзя удалить роль, к ней привязаны кейсы. Сначала измените или удалите эти кейсы.'
        );
      }
      throw e;
    }
  }
}

