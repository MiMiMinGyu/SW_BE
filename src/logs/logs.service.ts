import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { Log } from './entities/log.entity';
import { User } from '../users/entities/user.entity';
import { Express } from 'express';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log)
    private logsRepository: Repository<Log>,
  ) {}

  async create(createLogDto: CreateLogDto, user: User, file: Express.Multer.File): Promise<Log> {
    const newLog = this.logsRepository.create({
      ...createLogDto,
      user,
      image: file ? file.originalname : null,
    });
    const savedLog = await this.logsRepository.save(newLog);

    if (savedLog.user) {
      delete (savedLog.user as any).password;
    }
    return savedLog;
  }

  async findAllByUser(userId: number): Promise<Log[]> {
    const logs = await this.logsRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    logs.forEach(log => {
      if (log.user) {
        delete (log.user as any).password;
      }
    });

    return logs;
  }

  async findOne(id: number): Promise<Log> {
    const log = await this.logsRepository.findOne({ 
      where: { id }, 
      relations: ['user']
    });
    if (!log) {
      throw new NotFoundException(`ID가 ${id}인 농사일지를 찾을 수 없습니다.`);
    }

    if (log.user) {
      delete (log.user as any).password;
    }
    
    return log;
  }

  //농사일지 수정
  async update(id: number, userId: number, updateLogDto: UpdateLogDto): Promise<Log> {
    const log = await this.logsRepository.findOne({ where: { id }, relations: ['user'] });
    if (!log) {
      throw new NotFoundException(`ID가 ${id}인 농사일지를 찾을 수 없습니다.`);
    }
    if (log.user.id !== userId) {
      throw new UnauthorizedException('이 일지를 수정할 권한이 없습니다.');
    }
    Object.assign(log, updateLogDto);
    const updatedLog = await this.logsRepository.save(log);

    if (updatedLog.user) {
        delete (updatedLog.user as any).password;
    }
    return updatedLog;
  }

  //농사일지 삭제
  async remove(id: number, userId: number): Promise<void> {
    const log = await this.logsRepository.findOne({ where: { id }, relations: ['user'] });
    if (!log) {
      throw new NotFoundException(`ID가 ${id}인 농사일지를 찾을 수 없습니다.`);
    }
    if (log.user.id !== userId) {
      throw new UnauthorizedException('이 일지를 삭제할 권한이 없습니다.');
    }
    await this.logsRepository.remove(log);
  }
}