import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/constants/role.enum';
import { CurrentUser } from '../common/decorators/user.decorator';

// Контроллер кейсов
@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  // Публичный список кейсов
  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
    @Query('roleId') roleId?: string,
    @Query('q') q?: string
  ) {
    return this.casesService.findAll(
      Number(page),
      Number(pageSize),
      roleId ? Number(roleId) : undefined,
      q
    );
  }

  // Публичное получение кейса
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.casesService.findOne(id);
  }

  // Создание кейса (ADMIN/EDITOR)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.ADMIN, AppRole.EDITOR)
  create(@Body() dto: CreateCaseDto, @CurrentUser() user: any) {
    return this.casesService.create(dto, user.sub);
  }

  // Обновление кейса (ADMIN/EDITOR)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.ADMIN, AppRole.EDITOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCaseDto
  ) {
    return this.casesService.update(id, dto);
  }

  // Удаление кейса (ADMIN/EDITOR)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AppRole.ADMIN, AppRole.EDITOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.casesService.remove(id);
  }
}

