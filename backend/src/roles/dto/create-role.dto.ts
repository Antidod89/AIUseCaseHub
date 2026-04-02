import { IsOptional, IsString } from 'class-validator';

// DTO для создания новой доменной роли (Role)
export class CreateRoleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

