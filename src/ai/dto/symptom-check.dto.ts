import { IsString, MinLength } from 'class-validator';

export class SymptomCheckDto {
  @IsString()
  @MinLength(5, { message: '증상은 5자 이상 입력해주세요.' })
  prompt: string;
}