/**
 * 데이터베이스 관련 상수들
 * 여러 설정 파일에서 공통으로 사용
 */

// 데이터베이스 기본값
export const DATABASE_DEFAULTS = {
  PORT: 5432,
  MAX_CONNECTIONS: 20,
  MIN_CONNECTIONS: 5,
  CONNECTION_TIMEOUT: 30000, // 30초
  IDLE_TIMEOUT: 10000, // 10초
  RETRY_ATTEMPTS_PROD: 10,
  RETRY_ATTEMPTS_DEV: 3,
  RETRY_DELAY: 3000, // 3초
} as const;

// 환경별 설정
export const DATABASE_CONFIG = {
  development: {
    synchronize: true,
    logging: ['query', 'error', 'warn', 'info', 'log'],
    retryAttempts: DATABASE_DEFAULTS.RETRY_ATTEMPTS_DEV,
    ssl: false,
  },
  production: {
    synchronize: false,
    logging: ['error', 'warn'],
    retryAttempts: DATABASE_DEFAULTS.RETRY_ATTEMPTS_PROD,
    ssl: { rejectUnauthorized: false },
    extra: {
      max: DATABASE_DEFAULTS.MAX_CONNECTIONS,
      min: DATABASE_DEFAULTS.MIN_CONNECTIONS,
      acquire: DATABASE_DEFAULTS.CONNECTION_TIMEOUT,
      idle: DATABASE_DEFAULTS.IDLE_TIMEOUT,
    },
  },
  test: {
    synchronize: true,
    logging: false,
    retryAttempts: 1,
    ssl: false,
    dropSchema: true, // 테스트 후 스키마 삭제
  },
} as const;

// 지원하는 환경 타입
export type DatabaseEnvironment = keyof typeof DATABASE_CONFIG;

// 필수 환경변수 목록
export const REQUIRED_DB_ENV_VARS = [
  'DB_HOST',
  'DB_USERNAME',
  'DB_DATABASE',
] as const;

// TypeORM 엔티티 파일 경로
export const ENTITY_PATHS = {
  ts: 'src/**/*.entity.ts',
  js: 'dist/**/*.entity.js',
} as const;

// 마이그레이션 관련 경로
export const MIGRATION_PATHS = {
  dir: 'migrations',
  pattern: 'migrations/*{.ts,.js}',
  tableName: 'typeorm_migrations',
} as const;
