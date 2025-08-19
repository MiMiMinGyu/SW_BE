import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { ScheduleType } from '../entities/schedule.entity';

export class ScheduleCropDto {
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

  @ApiProperty({
    example: '방울토마토',
    description: '작물 품종',
    nullable: true,
  })
  variety: string | null;

  @ApiProperty({
    example: '2024-03-15T00:00:00.000Z',
    description: '심은 날짜',
  })
  plantingDate: Date;

  @ApiProperty({
    example: '2024-08-15T00:00:00.000Z',
    description: '예상 수확일',
    nullable: true,
  })
  expectedHarvestDate: Date | null;

  @ApiProperty({
    example: 'growing',
    description: '작물 상태 (growing: 성장중, harvested: 수확완료, dead: 고사)',
    nullable: true,
  })
  status: string | null;

  @ApiProperty({
    example: '베란다 화분에서 키우는 방울토마토입니다.',
    description: '작물 설명',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    example: '2024-01-15T10:00:00.000Z',
    description: '생성일',
  })
  createdAt: Date;
}

export class ScheduleResponseDto {
  @ApiProperty({
    example: 1,
    description: '일지 고유 ID',
  })
  id: number;

  @ApiProperty({
    example: '토마토 씨앗 파종',
    description: '일지 제목',
  })
  title: string;

  @ApiProperty({
    example: '오늘은 토마토 씨앗을 심었습니다.',
    description: '일지 내용',
    nullable: true,
  })
  content: string | null;

  @ApiProperty({
    example: '2025-08-15',
    description: '일지 작성 날짜',
  })
  date: string;

  @ApiProperty({
    example: '/uploads/logs/image.jpg',
    description: '첨부 이미지 경로',
    nullable: true,
  })
  image: string | null;

  @ApiProperty({
    example: '#4CAF50',
    description: '캘린더 표시 색상 (HEX 코드)',
    nullable: true,
  })
  color: string | null;

  @ApiProperty({
    enum: ScheduleType,
    example: ScheduleType.CROP_DIARY,
    description: '일정 유형 (crop_diary: 작물 일지, personal: 개인 일정)',
  })
  type: ScheduleType;

  @ApiProperty({
    type: UserResponseDto,
    description: '일정 소유자 정보',
  })
  user: UserResponseDto;

  @ApiProperty({
    type: ScheduleCropDto,
    description: '관련 작물 정보',
    nullable: true,
  })
  crop: ScheduleCropDto | null;

  @ApiProperty({
    example: '2025-08-12T09:30:00.000Z',
    description: '일정 생성일',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-08-12T09:30:00.000Z',
    description: '일정 수정일',
  })
  updatedAt: Date;
}

export class ScheduleListResponseDto {
  @ApiProperty({
    type: [ScheduleResponseDto],
    description: '일지 목록',
  })
  schedules: ScheduleResponseDto[];

  @ApiProperty({
    example: 15,
    description: '총 일지 개수',
  })
  total: number;
}
