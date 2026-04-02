import { IsString } from 'class-validator';

// DTO для обновления токенов через тело запроса (при необходимости)
export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

