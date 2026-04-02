import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { CasesModule } from './cases/cases.module';
import { TechnologiesModule } from './technologies/technologies.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

// Корневой модуль приложения
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    CasesModule,
    TechnologiesModule
  ]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

