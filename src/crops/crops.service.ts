import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';
import { CropResponseDto } from './dto/crop-response.dto';
import { Crop } from './entities/crop.entity';
import { User } from '../users/entities/user.entity';
import { UserType } from '../users/enums/user-type.enum';

@Injectable()
export class CropsService {
  private readonly logger = new Logger(CropsService.name);

  constructor(
    @InjectRepository(Crop)
    private readonly cropsRepository: Repository<Crop>,
  ) {}

  /**
   * 안전한 작물 정보 반환 (사용자 비밀번호 제거)
   */
  private toSafeCrop(crop: Crop): CropResponseDto {
    const result: CropResponseDto = {
      id: crop.id,
      name: crop.name,
      variety: crop.variety,
      plantingDate: crop.plantingDate,
      expectedHarvestDate: crop.expectedHarvestDate,
      status: crop.status,
      description: crop.description,
      createdAt: crop.createdAt,
      user: crop.user
        ? {
            id: crop.user.id,
            email: crop.user.email,
            nickname: crop.user.nickname,
            userType: crop.user.userType,
            profileImage: crop.user.profileImage,
            createdAt: crop.user.createdAt,
            updatedAt: crop.user.updatedAt,
          }
        : {
            id: 0,
            email: '',
            nickname: '',
            userType: UserType.HOBBY,
            profileImage: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
      logCount: crop.logs ? crop.logs.length : 0,
    };
    return result;
  }

  /**
   * 날짜 검증
   */
  private validateDates(plantingDate: Date, expectedHarvestDate?: Date): void {
    const now = new Date();

    if (plantingDate > now) {
      throw new BadRequestException('심은 날짜는 미래일 수 없습니다.');
    }

    if (expectedHarvestDate && expectedHarvestDate <= plantingDate) {
      throw new BadRequestException(
        '예상 수확일은 심은 날짜보다 이후여야 합니다.',
      );
    }
  }

  /**
   * 작물 등록
   */
  async create(
    createCropDto: CreateCropDto,
    user: User,
  ): Promise<CropResponseDto> {
    try {
      const plantingDate = new Date(createCropDto.plantingDate);
      const expectedHarvestDate = createCropDto.expectedHarvestDate
        ? new Date(createCropDto.expectedHarvestDate)
        : undefined;

      // 날짜 검증
      this.validateDates(plantingDate, expectedHarvestDate);

      const newCrop = this.cropsRepository.create({
        name: createCropDto.name,
        variety: createCropDto.variety,
        plantingDate,
        expectedHarvestDate,
        status: createCropDto.status || 'growing',
        description: createCropDto.description,
        user,
      });

      const savedCrop = await this.cropsRepository.save(newCrop);
      this.logger.log(`새 작물 등록: ${savedCrop.name} (사용자: ${user.id})`);

      // 관계 데이터와 함께 조회
      const cropWithUser = await this.cropsRepository.findOne({
        where: { id: savedCrop.id },
        relations: ['user'],
      });

      return this.toSafeCrop(cropWithUser!);
    } catch (error) {
      this.logger.error(`작물 생성 실패 (사용자: ${user.id}):`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        '작물 등록 중 오류가 발생했습니다.',
      );
    }
  }

  /**
   * 내 작물 전체 조회
   */
  async findAllByUser(userId: number): Promise<CropResponseDto[]> {
    try {
      const crops = await this.cropsRepository.find({
        where: { user: { id: userId } },
        relations: ['user', 'logs'],
        order: { createdAt: 'DESC' },
      });

      return crops.map((crop) => this.toSafeCrop(crop));
    } catch (error) {
      this.logger.error(`작물 목록 조회 실패 (사용자: ${userId}):`, error);
      throw new InternalServerErrorException(
        '작물 목록 조회 중 오류가 발생했습니다.',
      );
    }
  }

  /**
   * 특정 작물 조회
   */
  async findOne(id: number, userId: number): Promise<CropResponseDto> {
    try {
      const crop = await this.cropsRepository.findOne({
        where: { id, user: { id: userId } },
        relations: ['user', 'logs'],
      });

      if (!crop) {
        throw new NotFoundException(
          `ID가 ${id}인 작물을 찾을 수 없거나 접근 권한이 없습니다.`,
        );
      }

      return this.toSafeCrop(crop);
    } catch (error) {
      this.logger.error(
        `작물 조회 실패 (ID: ${id}, 사용자: ${userId}):`,
        error,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        '작물 조회 중 오류가 발생했습니다.',
      );
    }
  }

  /**
   * 작물 정보 수정
   */
  async update(
    id: number,
    userId: number,
    updateCropDto: UpdateCropDto,
  ): Promise<CropResponseDto> {
    try {
      // 기존 작물 조회 및 권한 확인
      const existingCrop = await this.cropsRepository.findOne({
        where: { id, user: { id: userId } },
        relations: ['user'],
      });

      if (!existingCrop) {
        throw new NotFoundException(
          `ID가 ${id}인 작물을 찾을 수 없거나 수정 권한이 없습니다.`,
        );
      }

      // 날짜 검증
      const plantingDate = updateCropDto.plantingDate
        ? new Date(updateCropDto.plantingDate)
        : existingCrop.plantingDate;
      const expectedHarvestDate = updateCropDto.expectedHarvestDate
        ? new Date(updateCropDto.expectedHarvestDate)
        : existingCrop.expectedHarvestDate;

      this.validateDates(plantingDate, expectedHarvestDate);

      // 업데이트 적용
      if (updateCropDto.name !== undefined)
        existingCrop.name = updateCropDto.name;
      if (updateCropDto.variety !== undefined)
        existingCrop.variety = updateCropDto.variety;
      if (updateCropDto.plantingDate !== undefined)
        existingCrop.plantingDate = plantingDate;
      if (updateCropDto.expectedHarvestDate !== undefined)
        existingCrop.expectedHarvestDate = expectedHarvestDate;
      if (updateCropDto.status !== undefined)
        existingCrop.status = updateCropDto.status;
      if (updateCropDto.description !== undefined)
        existingCrop.description = updateCropDto.description;

      const updatedCrop = await this.cropsRepository.save(existingCrop);
      this.logger.log(
        `작물 정보 수정: ${updatedCrop.name} (ID: ${id}, 사용자: ${userId})`,
      );

      // 관계 데이터와 함께 조회
      const cropWithRelations = await this.cropsRepository.findOne({
        where: { id: updatedCrop.id },
        relations: ['user', 'logs'],
      });

      return this.toSafeCrop(cropWithRelations!);
    } catch (error) {
      this.logger.error(
        `작물 수정 실패 (ID: ${id}, 사용자: ${userId}):`,
        error,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        '작물 정보 수정 중 오류가 발생했습니다.',
      );
    }
  }

  /**
   * 작물 삭제
   */
  async remove(id: number, userId: number): Promise<void> {
    try {
      const crop = await this.cropsRepository.findOne({
        where: { id, user: { id: userId } },
        relations: ['user'],
      });

      if (!crop) {
        throw new NotFoundException(
          `ID가 ${id}인 작물을 찾을 수 없거나 삭제 권한이 없습니다.`,
        );
      }

      await this.cropsRepository.remove(crop);
      this.logger.log(`작물 삭제: ${crop.name} (ID: ${id}, 사용자: ${userId})`);
    } catch (error) {
      this.logger.error(
        `작물 삭제 실패 (ID: ${id}, 사용자: ${userId}):`,
        error,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        '작물 삭제 중 오류가 발생했습니다.',
      );
    }
  }
}
