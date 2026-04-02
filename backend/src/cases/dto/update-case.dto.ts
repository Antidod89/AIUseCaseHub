import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min
} from 'class-validator';

// DTO для обновления кейса
export class UpdateCaseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  effect?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  technologiesHtml?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  roleId?: number;

  @IsOptional()
  @IsArray()
  technologyIds?: number[];
}

