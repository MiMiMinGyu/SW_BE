import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { AuthService, JwtPayload } from '../auth.service';
import { User } from '../../users/entities/user.entity';

// JWT 전략에서 반환할 사용자 타입
export type JwtUser = Omit<User, 'password'>;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      // 추가 옵션들
      jsonWebTokenOptions: {
        ignoreNotBefore: false,
        clockTolerance: 30, // 30초의 클록 편차 허용
      },
    });
  }

  /**
   * JWT 토큰이 유효할 때 호출되는 메서드
   * payload가 검증된 후 실행됨
   */
  async validate(payload: JwtPayload): Promise<JwtUser> {
    // 페이로드 구조 검증
    if (!payload.sub || !payload.email) {
      this.logger.warn('JWT 페이로드가 유효하지 않음:', payload);
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    // 토큰 만료 시간 확인 (추가 검증)
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      this.logger.warn(`만료된 토큰 사용 시도: ${payload.sub}`);
      throw new UnauthorizedException('토큰이 만료되었습니다.');
    }

    try {
      // AuthService를 통해 사용자 정보 검증
      const user = await this.authService.validateUser(payload);

      if (!user) {
        this.logger.warn(
          `JWT 검증 실패 - 사용자를 찾을 수 없음: ${payload.sub}`,
        );
        throw new UnauthorizedException('인증된 사용자가 아닙니다.');
      }

      // 성공적으로 검증된 사용자 정보 반환
      // 이 객체가 req.user에 저장됨
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(
        `JWT 검증 중 오류 발생 (사용자 ID: ${payload.sub}):`,
        error,
      );
      throw new UnauthorizedException('토큰 검증 중 오류가 발생했습니다.');
    }
  }
}
