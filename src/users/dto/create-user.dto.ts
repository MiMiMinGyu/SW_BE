import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';

export enum UserType {
  EXPERT = 'expert',
  HOBBY = 'hobby',
}
//회원가입 UserType 따로 정의한 이유 어떤 작업을 할 때, 많이 필요한 정보라서 꺼내쓰기 편해야 함.

export class CreateUserDto {
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.'})
  email: string;

  @IsString({ message: '비밀번호는 문자열이어야 합니다.'})
  @MinLength(8, { message: '비밀번호는 8자 이상이어야 합니다.'})
  password: string;

  @IsString({ message: '닉네임은 문자열이어야 합니다.'})
  @MinLength(2, { message: '닉네임은 2자 이상이어야 합니다.'})
  nickname: string;

  @IsEnum(UserType, { message: 'expert 또는 hobby 중에서 선택해야 합니다.'})
  userType: UserType;
}