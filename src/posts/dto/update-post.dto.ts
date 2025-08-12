import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdatePostDto {
  @ApiPropertyOptional({
    example: '수정된 게시글 제목',
    description: '게시글 제목 (1~200자)',
  })
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @MinLength(1, { message: '제목은 1자 이상이어야 합니다.' })
  @MaxLength(200, { message: '제목은 200자 이하여야 합니다.' })
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example: '수정된 게시글 내용입니다.',
    description: '게시글 내용',
  })
  @IsString({ message: '내용은 문자열이어야 합니다.' })
  @MinLength(1, { message: '내용은 1자 이상이어야 합니다.' })
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    example: PostCategory.KNOWHOW,
    description: '게시글 카테고리',
    enum: PostCategory,
  })
  @IsEnum(PostCategory, { message: '올바른 카테고리를 선택해주세요.' })
  @IsOptional()
  category?: PostCategory;

  @ApiPropertyOptional({
    example: ['수정된태그', '새태그'],
    description: '게시글 태그 (최대 10개)',
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: '태그는 배열 형태여야 합니다.' })
  @IsString({ each: true, message: '각 태그는 문자열이어야 합니다.' })
  @ArrayMaxSize(10, { message: '태그는 최대 10개까지 가능합니다.' })
  tags?: string[];

  @ApiPropertyOptional({
    example: ['newimage1.jpg', 'newimage2.jpg'],
    description: '첨부 이미지 파일명 배열',
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: '이미지는 배열 형태여야 합니다.' })
  @IsString({ each: true, message: '각 이미지는 문자열이어야 합니다.' })
  @ArrayMaxSize(5, { message: '이미지는 최대 5개까지 업로드 가능합니다.' })
  images?: string[];
}
