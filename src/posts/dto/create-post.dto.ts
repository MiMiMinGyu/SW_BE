import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  MinLength,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { PostCategory } from '../enums/post-category.enum';

export class CreatePostDto {
  @ApiProperty({
    example: '배추 모종에 작은 벌레가 생겼는데 어떻게 해야 하나요?',
    description: '게시글 제목 (1~200자)',
  })
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @MinLength(1, { message: '제목은 1자 이상이어야 합니다.' })
  @MaxLength(200, { message: '제목은 200자 이하여야 합니다.' })
  title: string;

  @ApiProperty({
    example:
      '어제 심은 배추 모종에 작은 벌레들이 보이기 시작했습니다. 잎에 구멍도 몇 개 생겼구요...',
    description: '게시글 내용',
  })
  @IsString({ message: '내용은 문자열이어야 합니다.' })
  @MinLength(1, { message: '내용은 1자 이상이어야 합니다.' })
  content: string;

  @ApiProperty({
    example: PostCategory.QUESTION,
    description: '게시글 카테고리',
    enum: PostCategory,
  })
  @IsEnum(PostCategory, { message: '올바른 카테고리를 선택해주세요.' })
  category: PostCategory;

  @ApiPropertyOptional({
    example: ['배추', '병해충', '모종'],
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
