import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { NcpmsService } from './ncpms.service';
import { DiseaseSearchDto, PestSearchDto } from './dto/disease-search.dto';
import {
  ProcessedDiseaseInfo,
  ProcessedPestInfo,
} from './interfaces/ncpms-api.interface';
import { GetUser } from '../common/decorators/get-user.decorator';
import { CropsService } from '../crops/crops.service';

@ApiTags('8. NCPMS - 병해충 정보 서비스')
@Controller('ncpms')
export class NcpmsController {
  constructor(
    private readonly ncpmsService: NcpmsService,
    private readonly cropsService: CropsService,
  ) {}

  @Get('diseases/search')
  @ApiOperation({ summary: '병 정보 검색', description: `작물명 또는 병명으로 병 정보를 검색합니다.` })
  @ApiQuery({ name: 'cropName', required: false, description: '작물명' })
  @ApiQuery({ name: 'diseaseName', required: false, description: '병명' })
  async searchDiseases(
    @Query() searchDto: DiseaseSearchDto,
  ): Promise<ProcessedDiseaseInfo[]> {
    return this.ncpmsService.searchDiseases(searchDto);
  }

  @Get('pests/search')
  @ApiOperation({ summary: '해충 정보 검색', description: `작물명 또는 해충명으로 해충 정보를 검색합니다.` })
  @ApiQuery({ name: 'cropName', required: false, description: '작물명' })
  @ApiQuery({ name: 'pestName', required: false, description: '해충명' })
  async searchPests(
    @Query() searchDto: PestSearchDto,
  ): Promise<ProcessedPestInfo[]> {
    return this.ncpmsService.searchPests(searchDto);
  }

  @Get('crops/:cropName/health-info')
  @ApiOperation({ summary: '작물별 종합 병해충 정보', description: `특정 작물에 대한 병해충 종합 정보를 제공합니다.` })
  @ApiParam({ name: 'cropName', description: '작물명', example: '토마토' })
  async getCropHealthInfo(@Param('cropName') cropName: string): Promise<any> {
    const healthInfo = await this.ncpmsService.getCropHealthInfo(cropName);

    return {
      success: true,
      message: `${cropName} 병해충 종합 정보를 조회했습니다.`,
      data: healthInfo,
    };
  }

  @Get('my-crops/health-recommendations')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '내 작물 기반 병해충 추천 정보', description: `사용자가 등록한 작물들을 기반으로 병해충 정보를 추천합니다.` })
  async getMyHealthRecommendations(@GetUser('id') userId: number): Promise<any> {
    const cropNames = await this.cropsService.getUserCropNames(userId);

    if (cropNames.length === 0) {
      return {
        success: true,
        message: '등록된 작물이 없습니다.',
        data: {
          cropHealthInfo: [],
          summary: { totalCrops: 0, totalDiseases: 0, totalPests: 0 },
        },
      };
    }

    const cropHealthInfo = await Promise.all(
      cropNames.map(async (cropName) => {
        const [diseases, pests] = await Promise.all([
          this.ncpmsService.searchDiseases({ cropName, displayCount: 5 }),
          this.ncpmsService.searchPests({ cropName, displayCount: 5 }),
        ]);

        return { cropName, diseases, pests };
      }),
    );

    const summary = {
      totalCrops: cropNames.length,
      totalDiseases: cropHealthInfo.reduce((sum, crop) => sum + crop.diseases.length, 0),
      totalPests: cropHealthInfo.reduce((sum, crop) => sum + crop.pests.length, 0),
    };

    return {
      cropHealthInfo,
      summary,
    };
  }

  /**
   * 👉 더 알아보기: crop + disease 기반 연관 질병 3개 조회
   */
  @Get('related')
  @ApiOperation({
    summary: '연관 질병 조회 (더 알아보기)',
    description: `작물명과 병명을 기반으로 NCPMS API에서 관련 질병 정보를 3개까지 제공합니다.`,
  })
  @ApiQuery({ name: 'crop', required: true, description: '작물명', example: '고추' })
  @ApiQuery({ name: 'disease', required: true, description: '병명', example: '탄저병' })
  @ApiResponse({
    status: 200,
    description: '연관 질병 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '연관 질병 검색 결과' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'D00000195' },
              name: { type: 'string', example: '탄저병' },
              imageUrl: { type: 'string', example: 'http://...' },
              summary: { type: 'string', example: '주로 과실에 발생한다...' },
              tips: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
  })
  async getRelated(
    @Query('crop') crop: string,
    @Query('disease') disease: string,
  ) {
    const diseases = await this.ncpmsService.searchDiseases({
      cropName: crop,
      diseaseName: disease,
      displayCount: 3,
    });

    const result = diseases.map((d) => ({
      id: d.id,
      name: d.diseaseName,
      imageUrl: d.images?.[0]?.url || null,
      summary: d.symptoms || '정보 없음',
      tips: [d.preventionMethod, d.biologyPrevention, d.chemicalPrevention].filter(Boolean),
    }));

    return diseases.map((d) => ({
      id: d.id,
      name: d.diseaseName,
      imageUrl: d.images?.[0]?.url || null,
      summary: d.symptoms || '정보 없음',
      tips: [d.preventionMethod, d.biologyPrevention, d.chemicalPrevention].filter(Boolean),
    }));
  }
}
