import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateReservationDto {
  @IsNumber()
  @Min(1)
  participantCount: number;

  @IsOptional()
  @IsString()
  message?: string;
}
