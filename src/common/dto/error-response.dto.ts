import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    example: 400,
    description: 'HTTP 상태 코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '잘못된 요청입니다.',
    description: '에러 메시지',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
  })
  message: string | string[];

  @ApiProperty({
    example: 'Bad Request',
    description: '에러 타입',
  })
  error: string;
}

export class ValidationErrorResponseDto {
  @ApiProperty({
    example: 400,
    description: 'HTTP 상태 코드',
  })
  statusCode: number;

  @ApiProperty({
    example: [
      '이메일은 올바른 형식이어야 합니다.',
      '비밀번호는 8자 이상이어야 합니다.',
    ],
    description: '유효성 검사 에러 메시지 배열',
  })
  message: string[];

  @ApiProperty({
    example: 'Bad Request',
    description: '에러 타입',
  })
  error: string;
}

export class UnauthorizedErrorResponseDto {
  @ApiProperty({
    example: 401,
    description: 'HTTP 상태 코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '인증에 실패했습니다.',
    description: '에러 메시지',
  })
  message: string;

  @ApiProperty({
    example: 'Unauthorized',
    description: '에러 타입',
  })
  error: string;
}

export class ConflictErrorResponseDto {
  @ApiProperty({
    example: 409,
    description: 'HTTP 상태 코드',
  })
  statusCode: number;

  @ApiProperty({
    example: '이미 존재하는 리소스입니다.',
    description: '에러 메시지',
  })
  message: string;

  @ApiProperty({
    example: 'Conflict',
    description: '에러 타입',
  })
  error: string;
}
