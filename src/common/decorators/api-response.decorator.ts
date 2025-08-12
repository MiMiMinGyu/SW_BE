import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

interface ApiResponseOptions {
  summary: string;
  description?: string;
  type?: Type<unknown>;
  isArray?: boolean;
}

export function ApiSuccessResponse(options: ApiResponseOptions) {
  const { summary, description, type, isArray = false } = options;

  const baseDecorators = [
    ApiOperation({ summary, description }),
    ApiResponse({
      status: HttpStatus.OK,
      description: description || summary,
      type: isArray && type ? [type] : type,
    }),
  ];

  return applyDecorators(...baseDecorators);
}

export function ApiCreatedResponse(options: ApiResponseOptions) {
  const { summary, description, type } = options;

  return applyDecorators(
    ApiOperation({ summary, description }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: description || summary,
      type,
    }),
  );
}

export function ApiErrorResponses() {
  return applyDecorators(
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: '잘못된 요청',
      schema: {
        example: {
          success: false,
          statusCode: 400,
          message: '요청 데이터가 올바르지 않습니다.',
          error: 'Bad Request',
          timestamp: '2024-01-01T00:00:00.000Z',
          path: '/api/endpoint',
          method: 'POST',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: '인증 실패',
      schema: {
        example: {
          success: false,
          statusCode: 401,
          message: '인증이 필요합니다.',
          error: 'Unauthorized',
          timestamp: '2024-01-01T00:00:00.000Z',
          path: '/api/endpoint',
          method: 'GET',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: '권한 없음',
      schema: {
        example: {
          success: false,
          statusCode: 403,
          message: '접근 권한이 없습니다.',
          error: 'Forbidden',
          timestamp: '2024-01-01T00:00:00.000Z',
          path: '/api/endpoint',
          method: 'GET',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: '서버 오류',
      schema: {
        example: {
          success: false,
          statusCode: 500,
          message: '서버 내부 오류가 발생했습니다.',
          error: 'Internal Server Error',
          timestamp: '2024-01-01T00:00:00.000Z',
          path: '/api/endpoint',
          method: 'POST',
        },
      },
    }),
  );
}
