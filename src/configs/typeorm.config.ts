import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { User } from '../users/entities/user.entity';
import { Log } from '../logs/entities/log.entity';
import { Crop } from '../crops/entities/crop.entity';

/**
 * TypeORM 설정 팩토리 함수
 * ConfigService를 통해 검증된 환경변수 사용
 */
export const createTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const isProduction = nodeEnv === 'production';
  const isDevelopment = nodeEnv === 'development';

  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),

    // 엔티티 설정
    entities: [User, Log, Crop],

    // 환경별 설정
    synchronize: isDevelopment, // 개발환경에서만 true
    logging: isDevelopment
      ? ['query', 'error', 'warn', 'info', 'log'] // 개발: 모든 로그
      : ['error', 'warn'], // 운영: 에러와 경고만

    // 운영환경 SSL 설정
    ssl: isProduction
      ? {
          rejectUnauthorized: false,
        }
      : false,

    // 연결 풀 및 PostgreSQL 설정 (운영환경 최적화)
    extra: isProduction
      ? {
          max: 20, // 최대 연결 수
          min: 5, // 최소 연결 수
          acquire: 30000, // 연결 획득 타임아웃 (30초)
          idle: 10000, // 유휴 연결 타임아웃 (10초)
          timezone: 'UTC', // PostgreSQL 타임존 설정
        }
      : {
          timezone: 'UTC', // 개발환경에서도 UTC 사용
        },

    // 자동 스키마 로드 (성능 최적화)
    autoLoadEntities: true,

    // 연결 재시도 설정
    retryAttempts: isProduction ? 10 : 3,
    retryDelay: 3000, // 3초
  };
};

/**
 * 환경변수를 직접 사용하는 설정 (CLI용)
 * ConfigService가 없는 환경에서 사용
 */
export const createDirectTypeOrmConfig = (): TypeOrmModuleOptions => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isDevelopment = nodeEnv === 'development';

  // 필수 환경변수 검증
  const requiredEnvVars = ['DB_HOST', 'DB_USERNAME', 'DB_DATABASE'];
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`,
    );
  }

  return {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [User, Log, Crop],
    synchronize: isDevelopment,
    logging: isDevelopment ? true : ['error', 'warn'],
    ssl: nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
  };
};
