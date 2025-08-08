import { IsString, IsNotEmpty } from 'class-validator';

export class CreateLogDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}