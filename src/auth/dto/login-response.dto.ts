import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class LoginResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInVzZXJUeXBlIjoiSE9CQlkiLCJpYXQiOjE2OTE3NzI4MDAsImV4cCI6MTY5MTc3NjQwMH0...',
    description: 'JWT 액세스 토큰',
  })
  accessToken: string;

  @ApiProperty({
    type: UserResponseDto,
    description: '로그인한 사용자 정보',
  })
  user: UserResponseDto;

  @ApiProperty({
    example: '1h',
    description: '토큰 만료 시간',
  })
  expiresIn: string;
}
