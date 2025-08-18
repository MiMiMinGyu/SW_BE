import { ApiProperty } from '@nestjs/swagger';
import { ReservationStatus } from '../enums/reservation-status.enum';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { PostResponseDto } from '../../posts/dto/post-response.dto';

export class ReservationResponseDto {
  @ApiProperty({ example: 1, description: '예약 ID' })
  id: number;

  @ApiProperty({ example: 2, description: '참가 인원 수' })
  participantCount: number;

  @ApiProperty({
    example: ReservationStatus.PENDING,
    description: '예약 상태',
    enum: ReservationStatus,
  })
  status: ReservationStatus;

  @ApiProperty({
    example: '가족 단위로 참여하고 싶습니다.',
    description: '예약 메시지',
    nullable: true,
  })
  message: string | null;

  @ApiProperty({
    example: '일정 변경으로 참여가 어려워졌습니다.',
    description: '취소 사유',
    nullable: true,
  })
  cancelReason: string | null;

  @ApiProperty({
    type: UserResponseDto,
    description: '예약 신청자 정보',
  })
  user: UserResponseDto;

  @ApiProperty({
    type: PostResponseDto,
    description: '예약 게시글 정보',
  })
  post: PostResponseDto;

  @ApiProperty({
    example: '2025-08-18T10:30:00.000Z',
    description: '예약 생성일',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-08-18T10:30:00.000Z',
    description: '예약 수정일',
  })
  updatedAt: Date;
}
