import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

// Точка входа в приложение NestJS
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Разрешаем CORS для фронтенда
app.enableCors({
  origin: true,
  credentials: true
});

  // Поддержка httpOnly cookies
  app.use(cookieParser());

  // Глобальная валидация DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 4000;

  await app.listen(port);
  logger.log(`Server is running on port ${port}`);
}

bootstrap();

