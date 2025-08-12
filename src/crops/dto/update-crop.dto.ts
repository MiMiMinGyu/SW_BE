import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCropDto, CropStatus } from './create-crop.dto';

export class UpdateCropDto extends PartialType(CreateCropDto) {
  @ApiPropertyOptional({
    example: '수정된 토마토',
    description: '수정할 작물 이름',
  })
  name?: string;

  @ApiPropertyOptional({
    example: '대추방울토마토',
    description: '수정할 작물 품종',
  })
  variety?: string;

  @ApiPropertyOptional({
    example: '2024-03-20',
    description: '수정할 심은 날짜',
  })
  plantingDate?: string;

  @ApiPropertyOptional({
    example: '2024-09-01',
    description: '수정할 예상 수확일',
  })
  expectedHarvestDate?: string;

  @ApiPropertyOptional({
    example: 'harvested',
    description: '수정할 작물 상태',
    enum: CropStatus,
  })
  status?: CropStatus;

  @ApiPropertyOptional({
    example: '수정된 작물 설명입니다.',
    description: '수정할 작물 설명',
  })
  description?: string;
}
