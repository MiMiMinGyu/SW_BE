import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString({ message: '닉네임은 문자열이어야 합니다.' })
  @MinLength(2, { message: '닉네임은 2자 이상이어야 합니다.' })
  @IsOptional() // 닉네임은 선택적으로 보낼 수 있음을 의미
  nickname?: string;

  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(8, { message: '비밀번호는 8자 이상이어야 합니다.' })
  @IsOptional() // 비밀번호는 선택적으로 보낼 수 있음을 의미
  password?: string;
}