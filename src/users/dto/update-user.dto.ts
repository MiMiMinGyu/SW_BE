import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
  IsEnum,
} from 'class-validator';
import { UserType } from '../enums/user-type.enum';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'newemail@example.com',
    description: '새 이메일',
  })
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: 'newpassword123!',
    description: '새 비밀번호 (8~20자)',
  })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(8, { message: '비밀번호는 8자 이상이어야 합니다.' })
  @MaxLength(20, { message: '비밀번호는 20자 이하이어야 합니다.' })
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    example: '홍길동',
    description: '닉네임 (2~20자)',
  })
  @IsString({ message: '닉네임은 문자열이어야 합니다.' })
  @MinLength(2, { message: '닉네임은 2자 이상이어야 합니다.' })
  @MaxLength(20, { message: '닉네임은 20자 이하이어야 합니다.' })
  @IsOptional()
  nickname?: string;

  @ApiPropertyOptional({
    example: '김농부',
    description: '사용자 이름 (2~20자)',
  })
  @IsString({ message: '사용자 이름은 문자열이어야 합니다.' })
  @MinLength(2, { message: '사용자 이름은 2자 이상이어야 합니다.' })
  @MaxLength(20, { message: '사용자 이름은 20자 이하여야 합니다.' })
  @IsOptional()
  name?: string | null;

  @ApiPropertyOptional({
    example: '토마토, 오이, 상추, 고추',
    description: '관심 작물 (콤마로 구분)',
  })
  @IsString({ message: '관심 작물은 문자열이어야 합니다.' })
  @MaxLength(500, { message: '관심 작물은 500자 이하여야 합니다.' })
  @IsOptional()
  interestCrops?: string | null;

  @ApiPropertyOptional({
    enum: UserType,
    example: UserType.EXPERT,
    description: '사용자 유형 (HOBBY, EXPERT, ADMIN)',
  })
  @IsEnum(UserType, {
    message: 'HOBBY, EXPERT, ADMIN 중에서 선택해야 합니다.',
  })
  @IsOptional()
  userType?: UserType;
}
