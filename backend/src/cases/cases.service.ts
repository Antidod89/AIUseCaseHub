import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';

// Сервис управления кейсами
@Injectable()
export class CasesService {
  constructor(private readonly prisma: PrismaService) {}

  // Публичный список кейсов с пагинацией и фильтром по роли
  async findAll(page = 1, pageSize = 10, roleId?: number) {
    const skip = (page - 1) * pageSize;
    const where = roleId ? { roleId } : undefined;

    const [total, items] = await Promise.all([
      this.prisma.case.count({ where }),
      this.prisma.case.findMany({
        where,
        include: {
          role: true,
          technologies: {
            include: {
              technology: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      })
    ]);

    return { total, items };
  }

  // Публичный просмотр одного кейса
  findOne(id: number) {
    return this.prisma.case.findUnique({
      where: { id },
      include: {
        role: true,
        technologies: {
          include: {
            technology: true
          }
        }
      }
    });
  }

  // Создание кейса (ADMIN/EDITOR)
  async create(dto: CreateCaseDto, createdById: number) {
    const createdCase = await this.prisma.case.create({
      data: {
        title: dto.title,
        description: dto.description,
        effect: dto.effect,
        author: dto.author ?? null,
        technologiesHtml: dto.technologiesHtml ?? null,
        roleId: dto.roleId
      }
    });

    if (dto.technologyIds?.length) {
      await this.syncTechnologies(createdCase.id, dto.technologyIds);
    }

    return this.findOne(createdCase.id);
  }

  // Обновление кейса
  async update(id: number, dto: UpdateCaseDto) {
    const existing = await this.prisma.case.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Кейс не найден');
    }

    await this.prisma.case.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        description: dto.description ?? existing.description,
        effect: dto.effect ?? existing.effect,
        author: dto.author ?? existing.author,
        technologiesHtml: dto.technologiesHtml ?? existing.technologiesHtml,
        roleId: dto.roleId ?? existing.roleId
      }
    });

    if (dto.technologyIds) {
      await this.syncTechnologies(id, dto.technologyIds);
    }

    return this.findOne(id);
  }

  // Удаление кейса
  async remove(id: number) {
    await this.prisma.caseTechnology.deleteMany({ where: { caseId: id } });
    return this.prisma.case.delete({ where: { id } });
  }

  // Синхронизация связей кейса с технологиями
  private async syncTechnologies(caseId: number, technologyIds: number[]) {
    await this.prisma.caseTechnology.deleteMany({ where: { caseId } });
    if (!technologyIds.length) return;

    await this.prisma.caseTechnology.createMany({
      data: technologyIds.map((technologyId) => ({
        caseId,
        technologyId
      }))
    });
  }
}

