import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
 Post,
  UseGuards
} from '@nestjs/common';
import { TechnologiesService } from './technologies.service';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/constants/role.enum';

// Контроллер технологий
@Controller('technologies')
export class TechnologiesController {
  constructor(private readonly technologiesService: TechnologiesService) {}

  // Публичный список технологий
  @Get()
  findAll() {
    return this.technologiesService.findAll();
  }

  // Публичное получение технологии
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.technologiesService.findOne(id);
  }

  // Создание технологии (ADMIN/EDITOR)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.ADMIN, AppRole.EDITOR)
  create(@Body() dto: CreateTechnologyDto) {
    return this.technologiesService.create(dto);
  }

  // Обновление технологии (ADMIN/EDITOR)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.ADMIN, AppRole.EDITOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTechnologyDto
  ) {
    return this.technologiesService.update(id, dto);
  }

  // Удаление технологии (ADMIN)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.technologiesService.remove(id);
  }
}

