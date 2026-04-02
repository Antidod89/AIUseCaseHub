import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';

// Сервис управления кейсами
@Injectable()
export class CasesService {
  constructor(private readonly prisma: PrismaService) {}

  // Публичный список кейсов с пагинацией, фильтром по роли и поиском по тексту
  // SQLite LOWER() не приводит кириллицу — регистронезависимый поиск делаем в Node (toLowerCase)
  async findAll(page = 1, pageSize = 10, roleId?: number, q?: string) {
    const skip = (page - 1) * pageSize;
    const search = q?.trim();
    const baseWhere: Prisma.CaseWhereInput = {};
    if (roleId) {
      baseWhere.roleId = roleId;
    }

    if (search) {
      const needle = search.toLowerCase();
      const lc = (s: string | null | undefined) => (s ?? '').toLowerCase();

      const candidates = await this.prisma.case.findMany({
        where: baseWhere,
        select: {
          id: true,
          title: true,
          summary: true,
          description: true,
          effect: true,
          author: true,
          createdAt: true,
          technologies: {
            select: {
              technology: { select: { name: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const matched = candidates.filter((c) => {
        const blob = [
          lc(c.title),
          lc(c.summary),
          lc(c.description),
          lc(c.effect),
          lc(c.author),
          ...c.technologies.map((ct) => lc(ct.technology.name))
        ].join('\n');
        return blob.includes(needle);
      });

      const total = matched.length;
      const pageIds = matched.slice(skip, skip + pageSize).map((c) => c.id);

      if (!pageIds.length) {
        return { total: 0, items: [] };
      }

      const items = await this.prisma.case.findMany({
        where: { id: { in: pageIds } },
        include: {
          role: true,
          technologies: {
            include: {
              technology: true
            }
          }
        }
      });

      const order = new Map(pageIds.map((id, i) => [id, i]));
      items.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

      return { total, items };
    }

    const where: Prisma.CaseWhereInput = baseWhere;

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
        summary: dto.summary ?? null,
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
        summary:
          dto.summary !== undefined ? dto.summary ?? null : existing.summary,
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

