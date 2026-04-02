import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min
} from 'class-validator';

// DTO для создания кейса
export class CreateCaseDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  effect: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  technologiesHtml?: string;

  @IsInt()
  @Min(1)
  roleId: number;

  @IsOptional()
  @IsArray()
  technologyIds?: number[];
}

