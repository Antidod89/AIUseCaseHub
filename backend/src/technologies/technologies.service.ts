import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';

// Сервис управления технологиями
@Injectable()
export class TechnologiesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.technology.findMany({
      orderBy: { name: 'asc' }
    });
  }

  findOne(id: number) {
    return this.prisma.technology.findUnique({ where: { id } });
  }

  create(dto: CreateTechnologyDto) {
    return this.prisma.technology.create({
      data: dto
    });
  }

  async update(id: number, dto: UpdateTechnologyDto) {
    const existing = await this.prisma.technology.findUnique({
      where: { id }
    });
    if (!existing) {
      throw new NotFoundException('Технология не найдена');
    }
    return this.prisma.technology.update({
      where: { id },
      data: dto
    });
  }

  remove(id: number) {
    return this.prisma.technology.delete({ where: { id } });
  }
}

