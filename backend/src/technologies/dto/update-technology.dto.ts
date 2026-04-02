import { IsOptional, IsString } from 'class-validator';

// DTO для обновления технологии
export class UpdateTechnologyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  link?: string;
}

