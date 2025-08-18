import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsBoolean, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: '정말 유용한 정보네요! 감사합니다.',
    description: '댓글 내용 (1~1000자)',
  })
  @IsString({ message: '댓글 내용은 문자열이어야 합니다.' })
  @MinLength(1, { message: '댓글 내용은 1자 이상이어야 합니다.' })
  @MaxLength(1000, { message: '댓글 내용은 1000자 이하여야 합니다.' })
  content: string;

  @ApiProperty({
    example: false,
    description: '익명 댓글 여부 (기본값: false)',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: '익명 여부는 불린 값이어야 합니다.' })
  isAnonymous?: boolean;
}