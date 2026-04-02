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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/constants/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';

// Контроллер доменных ролей
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // Публичный список ролей
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  // Публичное получение роли
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  // Создание роли (ADMIN/EDITOR)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.ADMIN, AppRole.EDITOR)
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  // Обновление роли (ADMIN/EDITOR)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.ADMIN, AppRole.EDITOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto
  ) {
    return this.rolesService.update(id, dto);
  }

  // Удаление роли (ADMIN/EDITOR)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.ADMIN, AppRole.EDITOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }
}

