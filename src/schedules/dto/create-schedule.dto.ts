import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsEnum,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { ScheduleType } from '../entities/schedule.entity';

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
    enum: ScheduleType,
    example: ScheduleType.CROP_DIARY,
    description: '일정 유형 (crop_diary: 작물 일지, personal: 개인 일정)',
    default: ScheduleType.CROP_DIARY,
  })
  @IsEnum(ScheduleType, { message: '올바른 일정 유형을 선택해주세요.' })
  @IsOptional()
  type?: ScheduleType;

  @ApiProperty({
    example: 1,
    description: '작물 ID (개인 일정인 경우 생략 가능)',
    required: false,
  })
  @IsNumber({}, { message: '작물 ID는 숫자여야 합니다.' })
  @IsOptional()
  cropId?: number;

  @ApiProperty({
    example: '#4CAF50',
    description: '캘린더 표시 색상 (HEX 코드, 선택사항)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '색상은 문자열이어야 합니다.' })
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: '올바른 HEX 색상 코드를 입력해주세요. (예: #4CAF50)',
  })
  color?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: '일지 이미지 파일 (선택사항)',
    required: false,
  })
  @IsOptional()
  image?: any;
}
