import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { CropResponseDto } from '../../crops/dto/crop-response.dto';

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
    type: UserResponseDto,
    description: '일정 소유자 정보',
  })
  user: UserResponseDto;

  @ApiProperty({
    type: CropResponseDto,
    description: '관련 작물 정보',
  })
  crop: CropResponseDto;

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
