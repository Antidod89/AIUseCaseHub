import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { AppRole } from '../../common/constants/role.enum';

// DTO для создания пользователя через админ-панель
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsEnum(AppRole)
  role?: AppRole;
}

