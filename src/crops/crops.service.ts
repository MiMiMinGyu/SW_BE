import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';
import { Crop } from './entities/crop.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CropsService {
  constructor(
    @InjectRepository(Crop)
    private cropsRepository: Repository<Crop>,
  ) {}

  //내 작물 등록
  create(createCropDto: CreateCropDto, user: User): Promise<Crop> {
    const newCrop = this.cropsRepository.create({
      ...createCropDto,
      user,
    });
    return this.cropsRepository.save(newCrop);
  }

  //내 작물 전체 조회
  findAllByUser(userId: number): Promise<Crop[]> {
    return this.cropsRepository.find({
      where: { user: { id: userId } },
      order: { plantingDate: 'DESC' },
    });
  }

  //내 작물 조회
  async findOne(id: number, userId: number): Promise<Crop> {
    const crop = await this.cropsRepository.findOneBy({ id, user: { id: userId } });
    if (!crop) {
      throw new NotFoundException(`ID가 ${id}인 작물을 찾을 수 없거나 볼 권한이 없습니다.`);
    }
    return crop;
  }

  //내 작물 수정
  async update(id: number, userId: number, updateCropDto: UpdateCropDto): Promise<Crop> {
    const crop = await this.findOne(id, userId); //권한 확인
    Object.assign(crop, updateCropDto);
    return this.cropsRepository.save(crop);
  }

  //내 작물 삭제
  async remove(id: number, userId: number): Promise<void> {
    const crop = await this.findOne(id, userId); //권한 확인
    await this.cropsRepository.remove(crop);
  }
}