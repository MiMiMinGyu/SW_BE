import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, error } = this.getErrorInfo(exception);

    // favicon 요청은 로깅하지 않음
    if (!request.url.includes('/favicon.ico')) {
      // 로깅
      this.logger.error(
        `HTTP ${status} Error: ${message} - ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : exception,
      );
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    response.status(status).json(errorResponse);
  }

  private getErrorInfo(exception: unknown): {
    status: number;
    message: string;
    error: string;
  } {
    // HTTP 예외 처리
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      let message = exception.message;
      if (typeof response === 'object' && response !== null) {
        const responseObj = response as Record<string, unknown>;
        if (typeof responseObj.message === 'string') {
          message = responseObj.message;
        } else if (Array.isArray(responseObj.message)) {
          message = responseObj.message.join(', ');
        }
      } else if (typeof response === 'string') {
        message = response;
      }

      return {
        status,
        message,
        error: this.getErrorName(status),
      };
    }

    // TypeORM 쿼리 실패 처리
    if (exception instanceof QueryFailedError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: '데이터베이스 작업 중 오류가 발생했습니다.',
        error: 'Database Error',
      };
    }

    // 일반 에러 처리
    if (exception instanceof Error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: '서버 내부 오류가 발생했습니다.',
        error: 'Internal Server Error',
      };
    }

    // 알 수 없는 예외 처리
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '알 수 없는 오류가 발생했습니다.',
      error: 'Unknown Error',
    };
  }

  private getErrorName(status: number): string {
    const errorNames: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
    };

    return errorNames[status] || 'Unknown Error';
  }
}
