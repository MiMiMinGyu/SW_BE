import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateScheduleDto {
  @ApiProperty({
    example: '토마토 씨앗 파종',
    description: '일지 제목 (1~200자)',
  })
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @MinLength(1, { message: '제목은 1자 이상이어야 합니다.' })
  @MaxLength(200, { message: '제목은 200자 이하여야 합니다.' })
  title: string;

  @ApiProperty({
    example:
      '오늘은 토마토 씨앗을 심는 날입니다. 물을 충분히 주고 햇빛이 잘 드는 곳에 배치했습니다.',
    description: '일지 내용 (선택사항)',
    required: false,
  })
  @IsString({ message: '내용은 문자열이어야 합니다.' })
  @MaxLength(2000, { message: '내용은 2000자 이하여야 합니다.' })
  @IsOptional()
  content?: string;

  @ApiProperty({
    example: '2025-08-15',
    description: '일지 작성 날짜 (YYYY-MM-DD 형식)',
  })
  @IsDateString(
    {},
    { message: '올바른 날짜 형식을 입력해주세요. (YYYY-MM-DD)' },
  )
  date: string;

  @ApiProperty({
    example: 1,
    description: '작물 ID (필수)',
  })
  @IsNumber({}, { message: '작물 ID는 숫자여야 합니다.' })
  cropId: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: '일지 이미지 파일 (선택사항)',
    required: false,
  })
  @IsOptional()
  image?: any;
}
