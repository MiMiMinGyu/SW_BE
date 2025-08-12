import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly saltRounds = 10;

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * 비밀번호 해싱
   */
  private async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      this.logger.error('Password hashing failed:', error);
      throw new InternalServerErrorException(
        '비밀번호 처리 중 오류가 발생했습니다.',
      );
    }
  }

  /**
   * 비밀번호 제거 (타입 안전)
   */
  private toSafe(user: User): Omit<User, 'password'> {
    const { password: _removed, ...safeUser } = user as User & {
      password?: string;
    };
    return safeUser;
  }

  /**
   * 이전 프로필 이미지 삭제
   */
  private async deleteOldProfileImage(imagePath: string): Promise<void> {
    if (!imagePath || imagePath.startsWith('http')) {
      return; // URL이거나 기본 이미지인 경우 건너뛰기
    }

    try {
      const fullPath = path.join(
        process.cwd(),
        imagePath.replace('/uploads/', 'uploads/'),
      );
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        this.logger.log(`이전 프로필 이미지 삭제됨: ${fullPath}`);
      }
    } catch (error) {
      this.logger.warn(`이전 프로필 이미지 삭제 실패: ${imagePath}`, error);
      // 파일 삭제 실패는 치명적이지 않으므로 에러를 던지지 않음
    }
  }

  /**
   * 회원 생성 (응답: safe)
   */
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const { email, password, nickname, userType } = createUserDto;

    // 이메일 중복 체크
    const existingUser = await this.usersRepository.findOne({
      where: { email: email.toLowerCase() }, // 이메일 소문자 변환
    });

    if (existingUser) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    try {
      const hashedPassword = await this.hashPassword(password);
      const newUser = this.usersRepository.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        nickname,
        userType,
      });

      const savedUser = await this.usersRepository.save(newUser);
      this.logger.log(
        `새 사용자 생성: ${savedUser.email} (ID: ${savedUser.id})`,
      );

      return this.toSafe(savedUser);
    } catch (error) {
      this.logger.error('사용자 생성 실패:', error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        '사용자 생성 중 오류가 발생했습니다.',
      );
    }
  }

  /**
   * 내부용: ID로 회원 조회 (password 포함)
   */
  async findById(id: number): Promise<User | null> {
    try {
      return await this.usersRepository.findOne({
        where: { id },
        select: {
          id: true,
          email: true,
          password: true, // 내부 사용을 위해 password 필드 포함
          nickname: true,
          userType: true,
          profileImage: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      this.logger.error(`사용자 조회 실패 (ID: ${id}):`, error);
      return null;
    }
  }

  /**
   * 내부용: 이메일로 회원 조회 (password 포함)
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.usersRepository.findOne({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          email: true,
          password: true, // 로그인 검증을 위해 password 필드 포함
          nickname: true,
          userType: true,
          profileImage: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      this.logger.error(`사용자 조회 실패 (이메일: ${email}):`, error);
      return null;
    }
  }

  /**
   * 외부 응답용: ID로 회원 조회 (password 제외)
   */
  async findSafeById(id: number): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id },
        select: {
          id: true,
          email: true,
          nickname: true,
          userType: true,
          profileImage: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return user ?? null;
    } catch (error) {
      this.logger.error(`안전한 사용자 조회 실패 (ID: ${id}):`, error);
      return null;
    }
  }

  /**
   * 회원 정보 수정 (응답: safe)
   */
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    try {
      // 닉네임 업데이트
      if (updateUserDto.nickname !== undefined) {
        user.nickname = updateUserDto.nickname.trim();
      }

      // 비밀번호 업데이트
      if (updateUserDto.password) {
        user.password = await this.hashPassword(updateUserDto.password);
      }

      const updatedUser = await this.usersRepository.save(user);
      this.logger.log(
        `사용자 정보 업데이트: ${updatedUser.email} (ID: ${updatedUser.id})`,
      );

      return this.toSafe(updatedUser);
    } catch (error) {
      this.logger.error(`사용자 업데이트 실패 (ID: ${id}):`, error);
      throw new InternalServerErrorException(
        '사용자 정보 수정 중 오류가 발생했습니다.',
      );
    }
  }

  /**
   * 프로필 이미지 업로드 (응답: safe)
   */
  async uploadProfileImage(
    userId: number,
    imagePath: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    try {
      // 이전 이미지 삭제
      if (user.profileImage) {
        await this.deleteOldProfileImage(user.profileImage);
      }

      // 새 이미지 경로 저장
      user.profileImage = imagePath;
      const savedUser = await this.usersRepository.save(user);

      this.logger.log(
        `프로필 이미지 업데이트: ${savedUser.email} (ID: ${savedUser.id})`,
      );
      return this.toSafe(savedUser);
    } catch (error) {
      this.logger.error(`프로필 이미지 업로드 실패 (ID: ${userId}):`, error);
      throw new InternalServerErrorException(
        '프로필 이미지 업로드 중 오류가 발생했습니다.',
      );
    }
  }

  /**
   * 비밀번호 검증
   */
  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      this.logger.error('비밀번호 검증 실패:', error);
      return false;
    }
  }
}
