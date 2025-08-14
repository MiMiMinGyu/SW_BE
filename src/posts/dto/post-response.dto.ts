import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { PostCategory } from '../enums/post-category.enum';

export class TagResponseDto {
  @ApiProperty({ example: 1, description: '태그 ID' })
  id: number;

  @ApiProperty({ example: '배추', description: '태그 이름' })
  name: string;

  @ApiProperty({ example: '#4CAF50', description: '태그 색상' })
  color: string;
}

export class PostResponseDto {
  @ApiProperty({ example: 1, description: '게시글 ID' })
  id: number;

  @ApiProperty({ example: '배추 모종 관리법', description: '게시글 제목' })
  title: string;

  @ApiProperty({
    example: '배추 모종을 심을 때 주의사항...',
    description: '게시글 내용',
  })
  content: string;

  @ApiProperty({
    example: PostCategory.KNOWHOW,
    description: '게시글 카테고리',
    enum: PostCategory,
  })
  category: PostCategory;

  @ApiProperty({
    example: ['image1.jpg', 'image2.jpg'],
    description: '첨부 이미지 목록',
    type: [String],
  })
  images: string[];

  @ApiProperty({ example: 127, description: '조회수' })
  viewCount: number;

  @ApiProperty({ example: 15, description: '좋아요 수' })
  likeCount: number;

  @ApiProperty({ example: 8, description: '댓글 수' })
  commentCount: number;

  @ApiProperty({
    type: UserResponseDto,
    description: '게시글 작성자 정보',
  })
  user: UserResponseDto;

  @ApiProperty({
    type: [TagResponseDto],
    description: '게시글 태그 목록',
  })
  tags: TagResponseDto[];

  @ApiProperty({ example: '2025-08-12T10:30:00.000Z', description: '생성일' })
  createdAt: Date;

  @ApiProperty({ example: '2025-08-12T10:30:00.000Z', description: '수정일' })
  updatedAt: Date;

  @ApiProperty({ example: false, description: '현재 사용자의 좋아요 여부' })
  isLiked?: boolean;
}

export class PostListResponseDto {
  @ApiProperty({
    type: [PostResponseDto],
    description: '게시글 목록',
  })
  posts: PostResponseDto[];

  @ApiProperty({ example: 150, description: '총 게시글 수' })
  total: number;

  @ApiProperty({ example: 1, description: '현재 페이지' })
  page: number;

  @ApiProperty({ example: 20, description: '페이지당 게시글 수' })
  limit: number;

  @ApiProperty({ example: 8, description: '총 페이지 수' })
  totalPages: number;
}
