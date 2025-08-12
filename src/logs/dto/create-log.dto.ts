import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateLogDto {
  @ApiProperty({
    example: '오늘 토마토에 물을 주고 비료를 주었습니다. 잎이 더 푸르러졌네요.',
    description: '농사일지 내용',
    maxLength: 1000,
  })
  @IsString({ message: '내용은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '내용을 입력해주세요.' })
  @MaxLength(1000, { message: '내용은 1000자를 초과할 수 없습니다.' })
  @Transform(({ value }): string => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value as string;
  })
  content: string;

  @ApiPropertyOptional({
    example: 1,
    description: '관련 작물 ID (선택사항)',
  })
  @IsOptional()
  @IsNumber({}, { message: '작물 ID는 숫자여야 합니다.' })
  @Transform(({ value }): number | undefined => {
    if (!value) {
      return undefined;
    }
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? undefined : parsed;
    }
    if (typeof value === 'number') {
      return value;
    }
    return undefined;
  })
  cropId?: number;
}
