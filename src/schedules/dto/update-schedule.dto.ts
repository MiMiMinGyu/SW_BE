import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateScheduleDto {
  @ApiPropertyOptional({
    example: '토마토 수확하기',
    description: '일지 제목 (1~200자)',
  })
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @MinLength(1, { message: '제목은 1자 이상이어야 합니다.' })
  @MaxLength(200, { message: '제목은 200자 이하여야 합니다.' })
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example: '수정된 일지 내용입니다.',
    description: '일지 내용',
  })
  @IsString({ message: '내용은 문자열이어야 합니다.' })
  @MaxLength(2000, { message: '내용은 2000자 이하여야 합니다.' })
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    example: '2025-08-20',
    description: '일지 작성 날짜 (YYYY-MM-DD 형식)',
  })
  @IsDateString(
    {},
    { message: '올바른 날짜 형식을 입력해주세요. (YYYY-MM-DD)' },
  )
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({
    example: 1,
    description: '작물 ID',
  })
  @IsNumber({}, { message: '작물 ID는 숫자여야 합니다.' })
  @IsOptional()
  cropId?: number;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: '일지 이미지 파일 (선택사항)',
  })
  @IsOptional()
  image?: any;
}
