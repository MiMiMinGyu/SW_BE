import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReservationDto {
  @ApiProperty({
    description: '참가 인원 수',
    minimum: 1,
    example: 2,
  })
  @IsNumber()
  @Min(1)
  participantCount: number;

  @ApiProperty({
    description: '예약 메시지',
    required: false,
    example: '체험 참가 신청합니다.',
  })
  @IsOptional()
  @IsString()
  message?: string;
}
