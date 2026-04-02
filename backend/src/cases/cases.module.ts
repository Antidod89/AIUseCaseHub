import { Module } from '@nestjs/common';
import { CasesService } from './cases.service';
import { CasesController } from './cases.controller';
import { PrismaModule } from '../prisma/prisma.module';

// Модуль кейсов
@Module({
  imports: [PrismaModule],
  providers: [CasesService],
  controllers: [CasesController]
})
export class CasesModule {}

