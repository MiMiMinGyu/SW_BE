import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class CommentResponseDto {
  @ApiProperty({ example: 1, description: '댓글 ID' })
  id: number;

  @ApiProperty({ example: '정말 유용한 정보네요!', description: '댓글 내용' })
  content: string;

  @ApiProperty({ example: 5, description: '댓글 좋아요 수' })
  likeCount: number;

  @ApiProperty({
    type: UserResponseDto,
    description: '댓글 작성자 정보',
  })
  user: UserResponseDto;

  @ApiProperty({ example: '2025-08-12T10:30:00.000Z', description: '댓글 생성일' })
  createdAt: Date;

  @ApiProperty({ example: '2025-08-12T10:30:00.000Z', description: '댓글 수정일' })
  updatedAt: Date;
}

export class CommentListResponseDto {
  @ApiProperty({
    type: [CommentResponseDto],
    description: '댓글 목록',
  })
  comments: CommentResponseDto[];

  @ApiProperty({ example: 25, description: '총 댓글 수' })
  total: number;
}