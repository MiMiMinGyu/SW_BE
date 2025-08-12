import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({
    example: '수정된 댓글 내용입니다.',
    description: '댓글 내용 (1~1000자)',
  })
  @IsString({ message: '댓글 내용은 문자열이어야 합니다.' })
  @MinLength(1, { message: '댓글 내용은 1자 이상이어야 합니다.' })
  @MaxLength(1000, { message: '댓글 내용은 1000자 이하여야 합니다.' })
  content: string;
}