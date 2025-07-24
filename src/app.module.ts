// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // 1. ConfigModule 설정: .env 파일을 읽기 위해 맨 위에 추가합니다.
    ConfigModule.forRoot({
      isGlobal: true, // 모든 모듈에서 .env 변수를 사용할 수 있게 설정
    }),

    // 2. TypeOrmModule 설정 변경: .env 파일의 값을 비동기적으로 주입받아 사용합니다.
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // ConfigModule을 import
      inject: [ConfigService], // ConfigService를 주입
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // 개발 환경에서는 true로 두는 것이 편리합니다.
      }),
    }),
    
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}