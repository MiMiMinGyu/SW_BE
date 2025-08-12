import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class UpdateScheduleDto {
  @ApiPropertyOptional({
    example: '토마토 수확하기',
    description: '일정 제목 (1~200자)',
  })
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @MinLength(1, { message: '제목은 1자 이상이어야 합니다.' })
  @MaxLength(200, { message: '제목은 200자 이하여야 합니다.' })
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example: '수정된 일정 설명입니다.',
    description: '일정 상세 설명',
  })
  @IsString({ message: '설명은 문자열이어야 합니다.' })
  @MaxLength(1000, { message: '설명은 1000자 이하여야 합니다.' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: '2025-08-20',
    description: '일정 날짜 (YYYY-MM-DD 형식)',
  })
  @IsDateString(
    {},
    { message: '올바른 날짜 형식을 입력해주세요. (YYYY-MM-DD)' },
  )
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({
    example: '16:00',
    description: '일정 시간 (HH:mm 형식)',
  })
  @IsString({ message: '시간은 문자열이어야 합니다.' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: '올바른 시간 형식을 입력해주세요. (HH:mm)',
  })
  @IsOptional()
  time?: string;

  @ApiPropertyOptional({
    example: 'harvest',
    description: '일정 카테고리',
    enum: ['personal', 'farming', 'meeting', 'maintenance', 'harvest', 'other'],
  })
  @IsString({ message: '카테고리는 문자열이어야 합니다.' })
  @MaxLength(20, { message: '카테고리는 20자 이하여야 합니다.' })
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    example: '#ff6b6b',
    description: '일정 색상 (hex 코드)',
  })
  @IsString({ message: '색상은 문자열이어야 합니다.' })
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: '올바른 hex 색상 코드를 입력해주세요. (예: #ff6b6b)',
  })
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({
    example: true,
    description: '일정 완료 여부',
  })
  @IsBoolean({ message: '완료 여부는 boolean 값이어야 합니다.' })
  @IsOptional()
  isCompleted?: boolean;
}
