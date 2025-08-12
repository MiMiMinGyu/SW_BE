import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { LoginResponseDto } from './dto/login-response.dto';

// JWT 페이로드 타입 정의
export interface JwtPayload {
  sub: number; // user ID
  email: string;
  userType: string;
  iat?: number; // issued at
  exp?: number; // expiration
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 회원가입
   * UsersService에 위임하여 중복 제거
   */
  async signup(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.usersService.create(createUserDto);
      this.logger.log(
        `새 사용자 회원가입 완료: ${user.email} (ID: ${user.id})`,
      );
      return user;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error('회원가입 중 오류 발생:', error);
      throw new InternalServerErrorException(
        '회원가입 처리 중 오류가 발생했습니다.',
      );
    }
  }

  /**
   * 로그인
   * 이메일과 비밀번호 검증 후 JWT 토큰 발급
   */
  async login(email: string, plainPassword: string): Promise<LoginResponseDto> {
    // 입력값 검증
    if (!email?.trim() || !plainPassword?.trim()) {
      throw new UnauthorizedException('이메일과 비밀번호를 입력해주세요.');
    }

    try {
      // 사용자 조회 (비밀번호 포함)
      const user = await this.usersService.findByEmail(
        email.toLowerCase().trim(),
      );
      if (!user) {
        // 보안상 동일한 메시지 사용
        throw new UnauthorizedException(
          '이메일 또는 비밀번호가 올바르지 않습니다.',
        );
      }

      // 비밀번호 검증 (UsersService의 validatePassword 메서드 사용)
      const isPasswordValid = await this.usersService.validatePassword(
        plainPassword,
        user.password,
      );

      if (!isPasswordValid) {
        this.logger.warn(`로그인 실패 - 잘못된 비밀번호: ${email}`);
        throw new UnauthorizedException(
          '이메일 또는 비밀번호가 올바르지 않습니다.',
        );
      }

      // JWT 토큰 생성
      const { accessToken, expiresIn } = await this.generateAccessToken(user);

      // 안전한 사용자 정보 조회
      const safeUser = await this.usersService.findSafeById(user.id);
      if (!safeUser) {
        throw new InternalServerErrorException(
          '사용자 정보 조회에 실패했습니다.',
        );
      }

      this.logger.log(`로그인 성공: ${user.email} (ID: ${user.id})`);

      return {
        accessToken,
        user: safeUser,
        expiresIn,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`로그인 처리 중 오류 발생 (${email}):`, error);
      throw new InternalServerErrorException(
        '로그인 처리 중 오류가 발생했습니다.',
      );
    }
  }

  /**
   * 액세스 토큰 생성
   */
  private async generateAccessToken(user: User): Promise<{
    accessToken: string;
    expiresIn: string;
  }> {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1h');

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
    };

    try {
      const accessToken = await this.jwtService.signAsync(payload);
      return { accessToken, expiresIn };
    } catch (error) {
      this.logger.error('JWT 토큰 생성 실패:', error);
      throw new InternalServerErrorException('토큰 생성에 실패했습니다.');
    }
  }

  /**
   * JWT 토큰 검증 및 사용자 정보 반환
   */
  async validateUser(
    payload: JwtPayload,
  ): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await this.usersService.findSafeById(payload.sub);
      if (!user) {
        this.logger.warn(
          `JWT 검증 실패 - 존재하지 않는 사용자: ${payload.sub}`,
        );
        return null;
      }

      // 이메일이 변경되었는지 확인 (추가 보안)
      if (user.email !== payload.email) {
        this.logger.warn(`JWT 검증 실패 - 이메일 불일치: ${payload.sub}`);
        return null;
      }

      return user;
    } catch (error) {
      this.logger.error(`JWT 사용자 검증 실패 (ID: ${payload.sub}):`, error);
      return null;
    }
  }

  /**
   * 리프레시 토큰 생성 (추후 구현 시 사용)
   */
  async generateRefreshToken(userId: number): Promise<string> {
    const payload = { sub: userId, type: 'refresh' };
    return this.jwtService.signAsync(payload, {
      expiresIn: '7d', // 리프레시 토큰은 더 긴 만료시간
    });
  }
}
