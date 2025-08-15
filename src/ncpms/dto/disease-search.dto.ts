import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class DiseaseSearchDto {
  @ApiPropertyOptional({
    description: '작물명으로 검색 (예: 토마토)',
    example: '토마토',
  })
  @IsOptional()
  @IsString()
  cropName?: string;

  @ApiPropertyOptional({
    description: '병명으로 검색 (예: 역병)',
    example: '역병',
  })
  @IsOptional()
  @IsString()
  diseaseName?: string;

  @ApiPropertyOptional({
    description: '검색 결과 개수 (기본값: 10, 최대: 50)',
    example: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  displayCount?: number = 10;

  @ApiPropertyOptional({
    description: '검색 시작 위치 (기본값: 1)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  startPoint?: number = 1;
}

export class PestSearchDto {
  @ApiPropertyOptional({
    description: '작물명으로 검색 (예: 토마토)',
    example: '토마토',
  })
  @IsOptional()
  @IsString()
  cropName?: string;

  @ApiPropertyOptional({
    description: '해충명으로 검색 (예: 진딧물)',
    example: '진딧물',
  })
  @IsOptional()
  @IsString()
  pestName?: string;

  @ApiPropertyOptional({
    description: '검색 결과 개수 (기본값: 10, 최대: 50)',
    example: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  displayCount?: number = 10;

  @ApiPropertyOptional({
    description: '검색 시작 위치 (기본값: 1)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  startPoint?: number = 1;
}
