import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class ScheduleResponseDto {
  @ApiProperty({
    example: 1,
    description: '일정 고유 ID',
  })
  id: number;

  @ApiProperty({
    example: '토마토 씨앗 파종',
    description: '일정 제목',
  })
  title: string;

  @ApiProperty({
    example: '오늘은 토마토 씨앗을 심는 날입니다.',
    description: '일정 상세 설명',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    example: '2025-08-15',
    description: '일정 날짜',
  })
  date: string;

  @ApiProperty({
    example: '14:30',
    description: '일정 시간',
    nullable: true,
  })
  time: string | null;

  @ApiProperty({
    example: 'farming',
    description: '일정 카테고리',
  })
  category: string;

  @ApiProperty({
    example: '#4285f4',
    description: '일정 색상',
  })
  color: string;

  @ApiProperty({
    example: false,
    description: '일정 완료 여부',
  })
  isCompleted: boolean;

  @ApiProperty({
    type: UserResponseDto,
    description: '일정 소유자 정보',
  })
  user: UserResponseDto;

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
    description: '일정 목록',
  })
  schedules: ScheduleResponseDto[];

  @ApiProperty({
    example: 15,
    description: '총 일정 개수',
  })
  total: number;
}
