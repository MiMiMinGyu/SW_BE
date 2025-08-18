import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReservationStatus } from '../enums/reservation-status.enum';

export class UpdateReservationStatusDto {
  @ApiProperty({
    description: '예약 상태',
    enum: ReservationStatus,
    example: ReservationStatus.CONFIRMED,
    enumName: 'ReservationStatus',
  })
  @IsEnum(ReservationStatus)
  status: ReservationStatus;

  @ApiProperty({
    description: '취소 사유 (CANCELLED 상태일 때 필요)',
    required: false,
    example: '일정 변경으로 인한 취소',
  })
  @IsOptional()
  @IsString()
  cancelReason?: string;
}
