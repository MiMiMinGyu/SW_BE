import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
  Matches,
} from 'class-validator';
import { UserType } from '../enums/user-type.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'text@example.com',
    description: '사용자 이메일',
  })
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  email: string;

  @ApiProperty({
    example: 'password123!',
    description: '비밀번호 (8~20자)',
  })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(8, { message: '비밀번호는 8자 이상이어야 합니다.' })
  @MaxLength(20, { message: '비밀번호는 20자 이하여야 합니다.' })
  password: string;

  @ApiProperty({
    example: '홍길동',
    description: '닉네임(2 ~ 20자)',
  })
  @IsString({ message: '닉네임은 문자열이어야 합니다.' })
  @MinLength(2, { message: '닉네임은 2자 이상이어야 합니다.' })
  @MaxLength(20, { message: '닉네임은 20자 이하여야 합니다.' })
  nickname: string;

  @ApiProperty({
    example: '김농부',
    description: '사용자 이름 (2~20자)',
    required: false,
  })
  @IsString({ message: '사용자 이름은 문자열이어야 합니다.' })
  @MinLength(2, { message: '사용자 이름은 2자 이상이어야 합니다.' })
  @MaxLength(20, { message: '사용자 이름은 20자 이하여야 합니다.' })
  @IsOptional()
  name?: string | null;

  @ApiProperty({
    example: '토마토, 오이, 상추',
    description: '관심 작물 (콤마로 구분)',
    required: false,
  })
  @IsString({ message: '관심 작물은 문자열이어야 합니다.' })
  @MaxLength(500, { message: '관심 작물은 500자 이하여야 합니다.' })
  @IsOptional()
  interestCrops?: string | null;

  @ApiProperty({
    enum: UserType,
    example: UserType.HOBBY,
    description: '사용자 유형 (HOBBY, PROFESSIONAL, ADMIN)',
    required: false,
  })
  @IsEnum(UserType, {
    message: 'expert 또는 hobby 중에서 선택해야 합니다.',
  })
  @IsOptional()
  userType: UserType;
}
