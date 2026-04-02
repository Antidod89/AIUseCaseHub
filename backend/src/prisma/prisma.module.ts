import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Глобальный модуль Prisma для доступа к БД
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService]
})
export class PrismaModule {}

