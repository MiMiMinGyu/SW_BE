import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '../enums/user-type.enum';

export class UserResponseDto {
  @ApiProperty({
    example: 1,
    description: '사용자 고유 ID',
  })
  id: number;

  @ApiProperty({
    example: 'user@example.com',
    description: '사용자 이메일',
  })
  email: string;

  @ApiProperty({
    example: '홍길동',
    description: '사용자 닉네임',
  })
  nickname: string;

  @ApiProperty({
    example: '김농부',
    description: '사용자 이름',
    nullable: true,
  })
  name?: string | null;

  @ApiProperty({
    example: '토마토, 오이, 상추',
    description: '관심 작물',
    nullable: true,
  })
  interestCrops?: string | null;

  @ApiProperty({
    enum: UserType,
    example: UserType.HOBBY,
    description: '사용자 타입',
  })
  userType: UserType;

  @ApiProperty({
    example: '/uploads/profile-image-123456789.jpg',
    description: '프로필 이미지 URL',
    nullable: true,
  })
  profileImage: string | null;

  @ApiProperty({
    example: '2025-08-11T10:00:00.000Z',
    description: '계정 생성일',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-08-11T10:00:00.000Z',
    description: '계정 수정일',
  })
  updatedAt: Date;
}
