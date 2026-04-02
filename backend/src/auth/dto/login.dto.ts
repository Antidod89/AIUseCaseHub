import { IsEmail, IsString } from 'class-validator';

// DTO для логина пользователя
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

