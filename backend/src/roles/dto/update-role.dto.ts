import { IsOptional, IsString } from 'class-validator';

// DTO для обновления роли
export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

