import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule, // ConfigService 사용을 위해 추가
    UsersModule, // UsersService 사용을 위해 import
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user', // req.user에 사용자 정보 저장
      session: false, // JWT는 stateless이므로 세션 사용 안 함
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [
    AuthService, // 다른 모듈에서 AuthService 사용 가능
    PassportModule, // 다른 모듈에서 Passport 가드 사용 가능
  ],
})
export class AuthModule {}
