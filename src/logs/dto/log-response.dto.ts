import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class LogResponseDto {
  @ApiProperty({
    example: 1,
    description: '농사일지 고유 ID',
  })
  id: number;

  @ApiProperty({
    example: '오늘 토마토에 물을 주고 비료를 주었습니다.',
    description: '농사일지 내용',
  })
  content: string;

  @ApiPropertyOptional({
    example: '/uploads/log-image-123456789.jpg',
    description: '농사일지 이미지 URL',
    nullable: true,
  })
  image: string | null;

  @ApiProperty({
    example: '2025-08-11T10:00:00.000Z',
    description: '작성일',
  })
  createdAt: Date;

  @ApiProperty({
    type: UserResponseDto,
    description: '작성자 정보',
  })
  user: UserResponseDto;

  @ApiPropertyOptional({
    example: {
      id: 1,
      name: '토마토',
      variety: '방울토마토',
    },
    description: '관련 작물 정보',
    nullable: true,
  })
  crop?: {
    id: number;
    name: string;
    variety?: string;
  } | null;
}

export class LogListResponseDto {
  @ApiProperty({
    type: [LogResponseDto],
    description: '농사일지 목록',
  })
  logs: LogResponseDto[];

  @ApiProperty({
    example: 25,
    description: '전체 농사일지 개수',
  })
  total: number;
}
