import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

import { User } from '../users/entities/user.entity';
import { Crop } from '../crops/entities/crop.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { PostLike } from '../posts/entities/post-like.entity';
import { Tag } from '../tags/entities/tag.entity';
import { PostTag } from '../posts/entities/post-tag.entity';
import { Reservation } from '../reservations/entities/reservation.entity';

// 환경변수 로드
config();

/**
 * TypeORM CLI용 DataSource 설정
 * 마이그레이션, 시드 데이터, 스키마 동기화 등에 사용
 */
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  // SSL 설정 (운영환경)
  ssl:
    process.env.NODE_ENV === 'production'
      ? {
          rejectUnauthorized: false,
        }
      : false,

  // 엔티티 경로 (컴파일된 JS 파일과 TS 파일 모두 지원)
  entities: [
    User,
    Crop,
    Schedule,
    Post,
    Comment,
    PostLike,
    Tag,
    PostTag,
    Reservation,
    // 추가 경로 방식 (필요시 사용)
    // join(__dirname, '../**/*.entity{.ts,.js}')
  ],

  // 마이그레이션 설정
  migrations: [join(__dirname, '../../migrations/*{.ts,.js}')],
  migrationsTableName: 'typeorm_migrations', // 마이그레이션 테이블명
  migrationsRun: false, // 애플리케이션 시작 시 자동 마이그레이션 실행 안함

  // 구독자 (subscribers) - 엔티티 이벤트 리스너
  subscribers: [join(__dirname, '../**/*.subscriber{.ts,.js}')],

  // CLI 전용 설정
  synchronize: false, // CLI에서는 항상 false (마이그레이션 사용)
  dropSchema: false, // 스키마 삭제 방지

  // 로깅 설정
  logging: ['error', 'warn', 'migration', 'schema'],
  logger: 'advanced-console',

  // 메타데이터 캐시 설정
  cache: false, // CLI에서는 캐시 비활성화
});

export default AppDataSource;

// 연결 테스트 함수 (선택사항)
export const testConnection = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established successfully');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};
