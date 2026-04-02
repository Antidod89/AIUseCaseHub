import { Module } from '@nestjs/common';
import { TechnologiesService } from './technologies.service';
import { TechnologiesController } from './technologies.controller';
import { PrismaModule } from '../prisma/prisma.module';

// Модуль технологий
@Module({
  imports: [PrismaModule],
  providers: [TechnologiesService],
  controllers: [TechnologiesController]
})
export class TechnologiesModule {}

