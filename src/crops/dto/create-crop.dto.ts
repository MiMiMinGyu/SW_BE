import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateCropDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsNotEmpty()
  plantingDate: string;
}