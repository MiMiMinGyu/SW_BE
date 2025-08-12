import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({
    example: true,
    description: '요청 성공 여부',
  })
  success: boolean;

  @ApiProperty({
    example: '요청이 성공적으로 처리되었습니다.',
    description: '응답 메시지',
  })
  message: string;

  @ApiProperty({
    description: '응답 데이터',
    required: false,
  })
  data?: T;
}
