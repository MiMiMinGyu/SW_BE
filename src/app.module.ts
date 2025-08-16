import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { UsersModule } from './users/users.module';
import { CropsModule } from './crops/crops.module';
import { SchedulesModule } from './schedules/schedules.module';
import { PostsModule } from './posts/posts.module';
import { TagsModule } from './tags/tags.module';
import { CommentsModule } from './comments/comments.module';
import { ReservationsModule } from './reservations/reservations.module';
import { AuthModule } from './auth/auth.module';

import { multerConfigFactory } from './common/config/multer.config';
import { validateConfig } from './common/config/config.validation';
import { createTypeOrmConfig } from './configs/typeorm.config';
import { NcpmsModule } from './ncpms/ncpms.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateConfig, // 환경변수 검증 추가
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: createTypeOrmConfig,
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN', '1h');

        if (!secret) {
          throw new Error('JWT_SECRET environment variable is required');
        }

        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),

    // 중앙화된 multer 설정 사용: 파일 업로드 처리를 위한 도구
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: multerConfigFactory,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        maxAge: '1d', // 캐시 설정
      },
    }),

    UsersModule,
    CropsModule,
    SchedulesModule,
    PostsModule,
    TagsModule,
    CommentsModule,
    ReservationsModule,
    AuthModule,
    NcpmsModule,
  ],
})
export class AppModule {}
