import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { Log } from './entities/log.entity';
import { User } from '../users/entities/user.entity';
import { Crop } from '../crops/entities/crop.entity';

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);

  constructor(
    @InjectRepository(Log)
    private readonly logsRepository: Repository<Log>,
    @InjectRepository(Crop)
    private readonly cropsRepository: Repository<Crop>,
  ) {}

  /**
   * 안전한 사용자 정보 반환 (비밀번호 제거)
   */
  private toSafeLog(log: Log): Log {
    if (log.user) {
      const { password: _removed, ...safeUser } = log.user as User & {
        password?: string;
      };
      log.user = safeUser as User;
    }
    return log;
  }

  /**
   * 이전 이미지 파일 삭제
   */
  private async deleteOldImage(imagePath: string): Promise<void> {
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
        this.logger.log(`이전 농사일지 이미지 삭제됨: ${fullPath}`);
      }
    } catch (error) {
      this.logger.warn(`이전 농사일지 이미지 삭제 실패: ${imagePath}`, error);
      // 파일 삭제 실패는 치명적이지 않으므로 에러를 던지지 않음
    }
  }

  /**
   * 농사일지 생성
   */
  async create(
    createLogDto: CreateLogDto,
    user: User,
    file?: Express.Multer.File,
  ): Promise<Log> {
    try {
      let crop: Crop | null = null;

      // 작물 ID가 제공된 경우 작물 존재 여부 확인
      if (createLogDto.cropId) {
        crop = await this.cropsRepository.findOne({
          where: { id: createLogDto.cropId, user: { id: user.id } },
        });

        if (!crop) {
          throw new BadRequestException(
            `ID가 ${createLogDto.cropId}인 작물을 찾을 수 없거나 접근 권한이 없습니다.`,
          );
        }
      }

      // 이미지 URL 생성
      const imageUrl = file ? `/uploads/${file.filename}` : null;

      const newLog = this.logsRepository.create({
        content: createLogDto.content,
        user,
        crop,
        image: imageUrl,
      });

      // TypeORM save 메서드는 저장된 엔티티를 반환
      const savedLog: Log = await this.logsRepository.save(newLog);

      // ID가 생성되었는지 확인 (타입 안전성)
      if (!savedLog.id) {
        throw new InternalServerErrorException('농사일지 저장에 실패했습니다.');
      }

      this.logger.log(`새 농사일지 생성: ${savedLog.id} (사용자: ${user.id})`);

      // 관계 데이터와 함께 조회
      const logWithRelations = await this.logsRepository.findOne({
        where: { id: savedLog.id },
        relations: ['user', 'crop'],
      });

      if (!logWithRelations) {
        throw new InternalServerErrorException(
          '저장된 농사일지를 찾을 수 없습니다.',
        );
      }

      return this.toSafeLog(logWithRelations);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error(`농사일지 생성 실패 (사용자: ${user.id}):`, error);
      throw new InternalServerErrorException(
        '농사일지 생성 중 오류가 발생했습니다.',
      );
    }
  }

  /**
   * 사용자별 농사일지 목록 조회
   */
  async findAllByUser(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ logs: Log[]; total: number }> {
    try {
      const [logs, total] = await this.logsRepository.findAndCount({
        where: { user: { id: userId } },
        relations: ['user', 'crop'],
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      const safeLogs = logs.map((log) => this.toSafeLog(log));

      return { logs: safeLogs, total };
    } catch (error) {
      this.logger.error(`농사일지 목록 조회 실패 (사용자: ${userId}):`, error);
      throw new InternalServerErrorException(
        '농사일지 목록 조회 중 오류가 발생했습니다.',
      );
    }
  }

  /**
   * 특정 농사일지 조회
   */
  async findOne(id: number): Promise<Log> {
    try {
      const log = await this.logsRepository.findOne({
        where: { id },
        relations: ['user', 'crop'],
      });

      if (!log) {
        throw new NotFoundException(
          `ID가 ${id}인 농사일지를 찾을 수 없습니다.`,
        );
      }

      return this.toSafeLog(log);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`농사일지 조회 실패 (ID: ${id}):`, error);
      throw new InternalServerErrorException(
        '농사일지 조회 중 오류가 발생했습니다.',
      );
    }
  }

  /**
   * 농사일지 수정
   */
  async update(
    id: number,
    userId: number,
    updateLogDto: UpdateLogDto,
    file?: Express.Multer.File,
  ): Promise<Log> {
    try {
      const log = await this.logsRepository.findOne({
        where: { id },
        relations: ['user', 'crop'],
      });

      if (!log) {
        throw new NotFoundException(
          `ID가 ${id}인 농사일지를 찾을 수 없습니다.`,
        );
      }

      if (log.user.id !== userId) {
        throw new UnauthorizedException(
          '이 농사일지를 수정할 권한이 없습니다.',
        );
      }

      // 작물 변경 처리
      if (updateLogDto.cropId !== undefined) {
        if (updateLogDto.cropId) {
          const crop = await this.cropsRepository.findOne({
            where: { id: updateLogDto.cropId, user: { id: userId } },
          });

          if (!crop) {
            throw new BadRequestException(
              `ID가 ${updateLogDto.cropId}인 작물을 찾을 수 없거나 접근 권한이 없습니다.`,
            );
          }
          log.crop = crop;
        } else {
          log.crop = null;
        }
      }

      // 내용 업데이트
      if (updateLogDto.content !== undefined) {
        log.content = updateLogDto.content;
      }

      // 이미지 업데이트
      if (file) {
        // 이전 이미지 삭제
        if (log.image) {
          await this.deleteOldImage(log.image);
        }
        log.image = `/uploads/${file.filename}`;
      }

      const updatedLog: Log = await this.logsRepository.save(log);
      this.logger.log(
        `농사일지 수정 완료: ${updatedLog.id} (사용자: ${userId})`,
      );

      return this.toSafeLog(updatedLog);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `농사일지 수정 실패 (ID: ${id}, 사용자: ${userId}):`,
        error,
      );
      throw new InternalServerErrorException(
        '농사일지 수정 중 오류가 발생했습니다.',
      );
    }
  }

  /**
   * 농사일지 삭제
   */
  async remove(id: number, userId: number): Promise<void> {
    try {
      const log = await this.logsRepository.findOne({
        where: { id },
        relations: ['user'],
      });

      if (!log) {
        throw new NotFoundException(
          `ID가 ${id}인 농사일지를 찾을 수 없습니다.`,
        );
      }

      if (log.user.id !== userId) {
        throw new UnauthorizedException(
          '이 농사일지를 삭제할 권한이 없습니다.',
        );
      }

      // 관련 이미지 파일 삭제
      if (log.image) {
        await this.deleteOldImage(log.image);
      }

      await this.logsRepository.remove(log);
      this.logger.log(`농사일지 삭제 완료: ${id} (사용자: ${userId})`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      this.logger.error(
        `농사일지 삭제 실패 (ID: ${id}, 사용자: ${userId}):`,
        error,
      );
      throw new InternalServerErrorException(
        '농사일지 삭제 중 오류가 발생했습니다.',
      );
    }
  }

  /**
   * 특정 작물의 농사일지 조회
   */
  async findByCrop(cropId: number, userId: number): Promise<Log[]> {
    try {
      const logs = await this.logsRepository.find({
        where: {
          crop: { id: cropId },
          user: { id: userId },
        },
        relations: ['user', 'crop'],
        order: { createdAt: 'DESC' },
      });

      return logs.map((log) => this.toSafeLog(log));
    } catch (error) {
      this.logger.error(
        `작물별 농사일지 조회 실패 (작물: ${cropId}, 사용자: ${userId}):`,
        error,
      );
      throw new InternalServerErrorException(
        '작물별 농사일지 조회 중 오류가 발생했습니다.',
      );
    }
  }
}
