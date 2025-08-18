import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class UpdateColorDto {
  @ApiProperty({
    example: '#4CAF50',
    description: '캘린더 표시 색상 (HEX 코드)',
  })
  @IsString({ message: '색상은 문자열이어야 합니다.' })
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: '올바른 HEX 색상 코드를 입력해주세요. (예: #4CAF50)',
  })
  color: string;
}
