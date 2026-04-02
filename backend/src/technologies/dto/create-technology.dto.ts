import { IsOptional, IsString } from 'class-validator';

// DTO для создания технологии
export class CreateTechnologyDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  link?: string;
}

