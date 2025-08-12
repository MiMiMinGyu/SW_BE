import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    const port = configService.get<number>('PORT', 3000);
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');

    // 전역 예외 필터 설정
    app.useGlobalFilters(new GlobalExceptionFilter());

    // 전역 응답 변환 인터셉터 설정
    app.useGlobalInterceptors(new ResponseTransformInterceptor());

    // 전역 Validation Pipe 설정
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // DTO에 정의되지 않은 속성 제거
        forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 있으면 에러
        transform: true, // 요청 데이터를 DTO 타입으로 자동 변환
        disableErrorMessages: nodeEnv === 'production', // 운영환경에서 상세 에러 메시지 숨김
        transformOptions: {
          enableImplicitConversion: true, // 암시적 타입 변환 허용
        },
      }),
    );

    // CORS 설정
    app.enableCors({
      origin:
        nodeEnv === 'production'
          ? configService.get<string>('FRONTEND_URL', 'https://yourdomain.com')
          : true, // 개발환경에서는 모든 origin 허용
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    // Swagger 설정 (개발환경에서만)
    if (nodeEnv !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('SmartFarming API')
        .setDescription('SmartFarming 프로젝트 API 문서')
        .setVersion('1.0.0')
        .addBearerAuth({
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'JWT 토큰을 입력하세요',
          in: 'header',
        })
        .addTag('Auth', '인증 관련 API')
        .addTag('Users', '사용자 관련 API')
        .addTag('Logs', '로그 관련 API')
        .addTag('Crops', '작물 관련 API')
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api-docs', app, document, {
        swaggerOptions: {
          persistAuthorization: true, // 인증 정보 유지
          tagsSorter: 'alpha',
          operationsSorter: 'alpha',
        },
      });

      logger.log(`📖 Swagger documentation: http://localhost:${port}/api-docs`);
    }

    // 글로벌 접두사 설정 (선택사항)
    // app.setGlobalPrefix('api/v1');

    await app.listen(port);

    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(`🌍 Environment: ${nodeEnv}`);
  } catch (error) {
    logger.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

// 처리되지 않은 예외 핸들링
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

void bootstrap();
