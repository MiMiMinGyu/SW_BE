import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateLogDto } from './create-log.dto';

export class UpdateLogDto extends PartialType(CreateLogDto) {
  @ApiPropertyOptional({
    example: '수정된 농사일지 내용입니다.',
    description: '수정할 농사일지 내용',
  })
  content?: string;

  @ApiPropertyOptional({
    example: 2,
    description: '수정할 관련 작물 ID',
  })
  cropId?: number;
}
