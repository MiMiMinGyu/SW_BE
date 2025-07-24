import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail() //이메일 형식인지
  email: string;

  @IsString()
  @MinLength(8) //최소 8자인지
  password: string;

  @IsString()
  @MinLength(2)
  nickname: string;
}