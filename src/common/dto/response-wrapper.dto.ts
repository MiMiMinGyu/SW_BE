import { ApiProperty } from '@nestjs/swagger';

export class ResponseWrapperDto<T> {
  @ApiProperty({
    description: '성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '상태 코드',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: '응답 메시지',
    example: '요청이 성공적으로 처리되었습니다.',
  })
  message: string;

  @ApiProperty({
    description: '응답 데이터',
  })
  data: T;

  @ApiProperty({
    description: '타임스탬프',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: string;

  constructor(data: T, message = '성공', statusCode = 200) {
    this.success = statusCode >= 200 && statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}
