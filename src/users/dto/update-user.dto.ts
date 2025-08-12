import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto {
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
    example: 'newpassword123!',
    description: '새 비밀번호 (8~20자)',
  })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @MinLength(8, { message: '비밀번호는 8자 이상이어야 합니다.' })
  @MaxLength(20, { message: '비밀번호는 20자 이하이어야 합니다.' })
  @IsOptional()
  password?: string;
}
