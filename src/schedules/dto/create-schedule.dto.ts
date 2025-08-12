import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateScheduleDto {
  @ApiProperty({
    example: '토마토 씨앗 파종',
    description: '일정 제목 (1~200자)',
  })
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @MinLength(1, { message: '제목은 1자 이상이어야 합니다.' })
  @MaxLength(200, { message: '제목은 200자 이하여야 합니다.' })
  title: string;

  @ApiProperty({
    example:
      '오늘은 토마토 씨앗을 심는 날입니다. 물을 충분히 주고 햇빛이 잘 드는 곳에 배치해야 합니다.',
    description: '일정 상세 설명 (선택사항)',
    required: false,
  })
  @IsString({ message: '설명은 문자열이어야 합니다.' })
  @MaxLength(1000, { message: '설명은 1000자 이하여야 합니다.' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '2025-08-15',
    description: '일정 날짜 (YYYY-MM-DD 형식)',
  })
  @IsDateString(
    {},
    { message: '올바른 날짜 형식을 입력해주세요. (YYYY-MM-DD)' },
  )
  date: string;

  @ApiProperty({
    example: '14:30',
    description: '일정 시간 (HH:mm 형식, 선택사항)',
    required: false,
  })
  @IsString({ message: '시간은 문자열이어야 합니다.' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: '올바른 시간 형식을 입력해주세요. (HH:mm)',
  })
  @IsOptional()
  time?: string;

  @ApiProperty({
    example: 'farming',
    description: '일정 카테고리',
    enum: ['personal', 'farming', 'meeting', 'maintenance', 'harvest', 'other'],
    default: 'personal',
    required: false,
  })
  @IsString({ message: '카테고리는 문자열이어야 합니다.' })
  @MaxLength(20, { message: '카테고리는 20자 이하여야 합니다.' })
  @IsOptional()
  category?: string;

  @ApiProperty({
    example: '#4285f4',
    description: '일정 색상 (hex 코드)',
    default: '#4285f4',
    required: false,
  })
  @IsString({ message: '색상은 문자열이어야 합니다.' })
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: '올바른 hex 색상 코드를 입력해주세요. (예: #4285f4)',
  })
  @IsOptional()
  color?: string;

  @ApiProperty({
    example: false,
    description: '일정 완료 여부',
    default: false,
    required: false,
  })
  @IsBoolean({ message: '완료 여부는 boolean 값이어야 합니다.' })
  @IsOptional()
  isCompleted?: boolean;
}
