import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { UserType } from '../entities/user.entity'; // UserType enum 임포트 추가

export class CreateUserDto {
  //이메일 형식인지
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  email: string;

  //비밀번호가 최소 8자인지
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(8, { message: '비밀번호는 8자 이상이어야 합니다.' })
  password: string;

  //닉네임이 최소 2글자인지
  @IsString({ message: '닉네임은 문자열이어야 합니다.' })
  @MinLength(2, { message: '닉네임은 2자 이상이어야 합니다.' })
  nickname: string;

  @IsEnum(UserType, { message: '유효한 사용자 유형(EXPERT 또는 HOBBY)을 선택해주세요.' })
  userType: UserType;
}