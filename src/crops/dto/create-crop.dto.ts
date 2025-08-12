import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum CropStatus {
  GROWING = 'growing',
  HARVESTED = 'harvested',
  DEAD = 'dead',
}

export class CreateCropDto {
  @ApiProperty({
    example: '토마토',
    description: '작물 이름',
    maxLength: 50,
  })
  @IsString({ message: '작물 이름은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '작물 이름을 입력해주세요.' })
  @MaxLength(50, { message: '작물 이름은 50자를 초과할 수 없습니다.' })
  @Transform(({ value }): string => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value as string;
  })
  name: string;

  @ApiPropertyOptional({
    example: '방울토마토',
    description: '작물 품종',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: '품종은 문자열이어야 합니다.' })
  @MaxLength(50, { message: '품종은 50자를 초과할 수 없습니다.' })
  @Transform(({ value }): string => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value as string;
  })
  variety?: string;

  @ApiProperty({
    example: '2024-03-15',
    description: '심은 날짜 (YYYY-MM-DD 형식)',
  })
  @IsDateString({}, { message: '올바른 날짜 형식(YYYY-MM-DD)을 입력해주세요.' })
  @IsNotEmpty({ message: '심은 날짜를 입력해주세요.' })
  plantingDate: string;

  @ApiPropertyOptional({
    example: '2024-08-15',
    description: '예상 수확일 (YYYY-MM-DD 형식)',
  })
  @IsOptional()
  @IsDateString({}, { message: '올바른 날짜 형식(YYYY-MM-DD)을 입력해주세요.' })
  expectedHarvestDate?: string;

  @ApiPropertyOptional({
    example: 'growing',
    description: '작물 상태',
    enum: CropStatus,
    default: CropStatus.GROWING,
  })
  @IsOptional()
  @IsEnum(CropStatus, { message: '올바른 작물 상태를 선택해주세요.' })
  status?: CropStatus;

  @ApiPropertyOptional({
    example: '베란다 화분에서 키우는 방울토마토입니다.',
    description: '작물 설명',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: '설명은 문자열이어야 합니다.' })
  @MaxLength(500, { message: '설명은 500자를 초과할 수 없습니다.' })
  @Transform(({ value }): string => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value as string;
  })
  description?: string;
}
