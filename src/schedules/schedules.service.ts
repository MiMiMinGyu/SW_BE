import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ScheduleResponseDto } from './dto/schedule-response.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
  ) {}

  async create(
    createScheduleDto: CreateScheduleDto,
    userId: number,
  ): Promise<ScheduleResponseDto> {
    const scheduleData = {
      ...createScheduleDto,
      category: createScheduleDto.category || 'personal',
      color: createScheduleDto.color || '#4285f4',
      isCompleted: createScheduleDto.isCompleted || false,
      user: { id: userId } as User,
    };

    const schedule = this.schedulesRepository.create(scheduleData);
    const savedSchedule = await this.schedulesRepository.save(schedule);

    return await this.findOneById(savedSchedule.id);
  }

  async findAll(userId: number): Promise<ScheduleResponseDto[]> {
    const schedules = await this.schedulesRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { date: 'ASC', time: 'ASC' },
    });

    return schedules.map((schedule) => this.transformToResponseDto(schedule));
  }

  async findOneById(id: number): Promise<ScheduleResponseDto> {
    const schedule = await this.schedulesRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!schedule) {
      throw new NotFoundException(`ID ${id}번 일정을 찾을 수 없습니다.`);
    }

    return this.transformToResponseDto(schedule);
  }

  async findByDateRange(
    userId: number,
    startDate: string,
    endDate: string,
  ): Promise<ScheduleResponseDto[]> {
    const schedules = await this.schedulesRepository.find({
      where: {
        user: { id: userId },
        date: Between(new Date(startDate), new Date(endDate)),
      },
      relations: ['user'],
      order: { date: 'ASC', time: 'ASC' },
    });

    return schedules.map((schedule) => this.transformToResponseDto(schedule));
  }

  async findByDate(
    userId: number,
    date: string,
  ): Promise<ScheduleResponseDto[]> {
    const schedules = await this.schedulesRepository.find({
      where: {
        user: { id: userId },
        date: new Date(date),
      },
      relations: ['user'],
      order: { time: 'ASC' },
    });

    return schedules.map((schedule) => this.transformToResponseDto(schedule));
  }

  async update(
    id: number,
    updateScheduleDto: UpdateScheduleDto,
    userId: number,
  ): Promise<ScheduleResponseDto> {
    const schedule = await this.schedulesRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!schedule) {
      throw new NotFoundException(`ID ${id}번 일정을 찾을 수 없습니다.`);
    }

    Object.assign(schedule, updateScheduleDto);
    await this.schedulesRepository.save(schedule);

    return await this.findOneById(id);
  }

  async remove(id: number, userId: number): Promise<void> {
    const schedule = await this.schedulesRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!schedule) {
      throw new NotFoundException(`ID ${id}번 일정을 찾을 수 없습니다.`);
    }

    await this.schedulesRepository.remove(schedule);
  }

  async toggleComplete(
    id: number,
    userId: number,
  ): Promise<ScheduleResponseDto> {
    const schedule = await this.schedulesRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!schedule) {
      throw new NotFoundException(`ID ${id}번 일정을 찾을 수 없습니다.`);
    }

    schedule.isCompleted = !schedule.isCompleted;
    await this.schedulesRepository.save(schedule);

    return await this.findOneById(id);
  }

  private transformToResponseDto(schedule: Schedule): ScheduleResponseDto {
    return {
      id: schedule.id,
      title: schedule.title,
      description: schedule.description,
      date: schedule.date.toISOString().split('T')[0], // YYYY-MM-DD format
      time: schedule.time,
      category: schedule.category,
      color: schedule.color,
      isCompleted: schedule.isCompleted,
      user: {
        id: schedule.user.id,
        email: schedule.user.email,
        nickname: schedule.user.nickname,
        name: schedule.user.name,
        interestCrops: schedule.user.interestCrops,
        profileImage: schedule.user.profileImage,
        userType: schedule.user.userType,
        createdAt: schedule.user.createdAt,
        updatedAt: schedule.user.updatedAt,
      },
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    };
  }
}
