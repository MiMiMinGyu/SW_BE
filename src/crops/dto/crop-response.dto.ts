import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class CropResponseDto {
  @ApiProperty({
    example: 1,
    description: '작물 고유 ID',
  })
  id: number;

  @ApiProperty({
    example: '토마토',
    description: '작물 이름',
  })
  name: string;

  @ApiPropertyOptional({
    example: '방울토마토',
    description: '작물 품종',
  })
  variety?: string;

  @ApiProperty({
    example: '2024-03-15T00:00:00.000Z',
    description: '심은 날짜',
  })
  plantingDate: Date;

  @ApiPropertyOptional({
    example: '2024-08-15T00:00:00.000Z',
    description: '예상 수확일',
  })
  expectedHarvestDate?: Date;

  @ApiPropertyOptional({
    example: 'growing',
    description: '작물 상태 (growing: 성장중, harvested: 수확완료, dead: 고사)',
    enum: ['growing', 'harvested', 'dead'],
  })
  status?: string;

  @ApiPropertyOptional({
    example: '베란다 화분에서 키우는 방울토마토입니다.',
    description: '작물 설명',
  })
  description?: string;

  @ApiProperty({
    example: '2024-01-15T10:00:00.000Z',
    description: '생성일',
  })
  createdAt: Date;

  @ApiProperty({
    type: UserResponseDto,
    description: '소유자 정보',
  })
  user: UserResponseDto;

  @ApiPropertyOptional({
    example: 15,
    description: '관련 농사일지 개수',
  })
  logCount?: number;
}

export class CropListResponseDto {
  @ApiProperty({
    type: [CropResponseDto],
    description: '작물 목록',
  })
  crops: CropResponseDto[];

  @ApiProperty({
    example: 10,
    description: '전체 작물 개수',
  })
  total: number;
}
