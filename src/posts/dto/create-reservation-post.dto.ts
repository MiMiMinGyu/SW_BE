import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  Max,
  ArrayMaxSize,
} from 'class-validator';

export class CreateReservationPostDto {
  @ApiProperty({
    example: '딸기 수확 체험 프로그램',
    description: '게시글 제목 (1~200자)',
  })
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @MinLength(1, { message: '제목은 1자 이상이어야 합니다.' })
  @MaxLength(200, { message: '제목은 200자 이하여야 합니다.' })
  title: string;

  @ApiProperty({
    example:
      '신선한 딸기를 직접 수확해보는 체험 프로그램입니다. 가족단위 방문 환영합니다.',
    description: '게시글 내용',
  })
  @IsString({ message: '내용은 문자열이어야 합니다.' })
  @MinLength(1, { message: '내용은 1자 이상이어야 합니다.' })
  content: string;

  @ApiProperty({
    example: 15000,
    description: '참가비 (원)',
  })
  @IsNumber({}, { message: '참가비는 숫자여야 합니다.' })
  @Min(0, { message: '참가비는 0원 이상이어야 합니다.' })
  price: number;

  @ApiProperty({
    example: 20,
    description: '최대 참가 인원',
  })
  @IsNumber({}, { message: '최대 참가 인원은 숫자여야 합니다.' })
  @Min(1, { message: '최대 참가 인원은 1명 이상이어야 합니다.' })
  @Max(100, { message: '최대 참가 인원은 100명 이하여야 합니다.' })
  maxParticipants: number;

  @ApiProperty({
    example: '2024-08-25T10:00:00.000Z',
    description: '체험 일정',
  })
  @IsDateString({}, { message: '올바른 날짜 형식이어야 합니다.' })
  scheduledDate: string;

  @ApiPropertyOptional({
    example: '경기도 화성시 농장로 123',
    description: '체험 장소',
  })
  @IsOptional()
  @IsString({ message: '장소는 문자열이어야 합니다.' })
  @MaxLength(200, { message: '장소는 200자 이하여야 합니다.' })
  location?: string;

  @ApiPropertyOptional({
    example: ['딸기', '수확체험', '가족체험'],
    description: '게시글 태그 (최대 10개)',
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: '태그는 배열 형태여야 합니다.' })
  @IsString({ each: true, message: '각 태그는 문자열이어야 합니다.' })
  @ArrayMaxSize(10, { message: '태그는 최대 10개까지 가능합니다.' })
  tags?: string[];

  @ApiPropertyOptional({
    example: ['image1.jpg', 'image2.jpg'],
    description: '첨부 이미지 파일명 배열',
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: '이미지는 배열 형태여야 합니다.' })
  @IsString({ each: true, message: '각 이미지는 문자열이어야 합니다.' })
  @ArrayMaxSize(5, { message: '이미지는 최대 5개까지 업로드 가능합니다.' })
  images?: string[];
}
