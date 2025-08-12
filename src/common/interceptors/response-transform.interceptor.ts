import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { ResponseWrapperDto } from '../dto/response-wrapper.dto';

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ResponseWrapperDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseWrapperDto<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data: T): ResponseWrapperDto<T> => {
        // 이미 ResponseWrapperDto 형식인 경우 그대로 반환
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'statusCode' in data &&
          'message' in data &&
          'data' in data &&
          'timestamp' in data
        ) {
          return data as unknown as ResponseWrapperDto<T>;
        }

        const statusCode = response.statusCode;
        const message = this.getSuccessMessage(statusCode);

        return new ResponseWrapperDto(data, message, statusCode);
      }),
    );
  }

  private getSuccessMessage(statusCode: number): string {
    const messages: Record<number, string> = {
      200: '요청이 성공적으로 처리되었습니다.',
      201: '리소스가 성공적으로 생성되었습니다.',
      202: '요청이 접수되었습니다.',
      204: '요청이 성공적으로 처리되었습니다.',
    };

    return messages[statusCode] || '성공';
  }
}
