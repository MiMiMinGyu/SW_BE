import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ScheduleResponseDto } from './dto/schedule-response.dto';
import { User } from '../users/entities/user.entity';
import { Crop } from '../crops/entities/crop.entity';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
    @InjectRepository(Crop)
    private cropsRepository: Repository<Crop>,
  ) {}

  async create(
    createScheduleDto: CreateScheduleDto,
    userId: number,
    imageUrl?: string,
  ): Promise<ScheduleResponseDto> {
    const crop = await this.cropsRepository.findOne({
      where: { id: createScheduleDto.cropId, user: { id: userId } },
    });
    if (!crop) {
      throw new NotFoundException(
        `ID ${createScheduleDto.cropId}번 작물을 찾을 수 없습니다.`,
      );
    }

    const scheduleData = {
      title: createScheduleDto.title,
      content: createScheduleDto.content || null,
      date: createScheduleDto.date,
      image: imageUrl || null,
      user: { id: userId } as User,
      crop,
    };

    const schedule = this.schedulesRepository.create(scheduleData);
    const savedSchedule = await this.schedulesRepository.save(schedule);

    return await this.findOneById(savedSchedule.id);
  }

  async findAll(
    userId: number,
    cropId?: number,
  ): Promise<ScheduleResponseDto[]> {
    const whereCondition: FindOptionsWhere<Schedule> = { user: { id: userId } };
    if (cropId) {
      whereCondition.crop = { id: cropId };
    }

    const schedules = await this.schedulesRepository.find({
      where: whereCondition,
      relations: ['user', 'crop'],
      order: { date: 'DESC' },
    });

    return schedules.map((schedule) => this.transformToResponseDto(schedule));
  }

  async findOneById(id: number): Promise<ScheduleResponseDto> {
    const schedule = await this.schedulesRepository.findOne({
      where: { id },
      relations: ['user', 'crop'],
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
    cropId?: number,
  ): Promise<ScheduleResponseDto[]> {
    const whereCondition: FindOptionsWhere<Schedule> = {
      user: { id: userId },
      date: Between(new Date(startDate), new Date(endDate)),
    };
    if (cropId) {
      whereCondition.crop = { id: cropId };
    }

    const schedules = await this.schedulesRepository.find({
      where: whereCondition,
      relations: ['user', 'crop'],
      order: { date: 'ASC' },
    });

    return schedules.map((schedule) => this.transformToResponseDto(schedule));
  }

  async findByDate(
    userId: number,
    date: string,
    cropId?: number,
  ): Promise<ScheduleResponseDto[]> {
    const whereCondition: FindOptionsWhere<Schedule> = {
      user: { id: userId },
      date: new Date(date),
    };
    if (cropId) {
      whereCondition.crop = { id: cropId };
    }

    const schedules = await this.schedulesRepository.find({
      where: whereCondition,
      relations: ['user', 'crop'],
      order: { createdAt: 'DESC' },
    });

    return schedules.map((schedule) => this.transformToResponseDto(schedule));
  }

  async update(
    id: number,
    updateScheduleDto: UpdateScheduleDto,
    userId: number,
    imageUrl?: string,
  ): Promise<ScheduleResponseDto> {
    const schedule = await this.schedulesRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!schedule) {
      throw new NotFoundException(`ID ${id}번 일지를 찾을 수 없습니다.`);
    }

    let crop = schedule.crop;
    if (updateScheduleDto.cropId) {
      const foundCrop = await this.cropsRepository.findOne({
        where: { id: updateScheduleDto.cropId, user: { id: userId } },
      });
      if (!foundCrop) {
        throw new NotFoundException(
          `ID ${updateScheduleDto.cropId}번 작물을 찾을 수 없습니다.`,
        );
      }
      crop = foundCrop;
    }

    Object.assign(schedule, updateScheduleDto, {
      crop,
      ...(imageUrl && { image: imageUrl }),
    });
    await this.schedulesRepository.save(schedule);

    return await this.findOneById(id);
  }

  async remove(id: number, userId: number): Promise<void> {
    const schedule = await this.schedulesRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!schedule) {
      throw new NotFoundException(`ID ${id}번 일지를 찾을 수 없습니다.`);
    }

    await this.schedulesRepository.remove(schedule);
  }

  private transformToResponseDto(schedule: Schedule): ScheduleResponseDto {
    return {
      id: schedule.id,
      title: schedule.title,
      content: schedule.content,
      date:
        schedule.date instanceof Date
          ? schedule.date.toISOString().split('T')[0]
          : schedule.date, // YYYY-MM-DD format
      image: schedule.image,
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
      crop: {
        id: schedule.crop.id,
        name: schedule.crop.name,
        variety: schedule.crop.variety,
        plantingDate: schedule.crop.plantingDate,
        expectedHarvestDate: schedule.crop.expectedHarvestDate,
        status: schedule.crop.status,
        description: schedule.crop.description,
        createdAt: schedule.crop.createdAt,
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
      },
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    };
  }
}
