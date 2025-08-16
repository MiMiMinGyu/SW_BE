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
  @ApiOperation({
    summary: '병 정보 검색',
    description: `작물명 또는 병명으로 병 정보를 검색합니다.

📋 주요 기능:
• 작물별 발생 가능한 병 정보 조회
• 병명으로 직접 검색
• 병 증상, 방제법, 예방법 정보 제공
• 병해충 관리시스템 공식 데이터 활용

🔍 검색 예시:
• ?cropName=토마토 (토마토에 발생하는 모든 병)
• ?diseaseName=역병 (역병 관련 정보)
• ?cropName=토마토&diseaseName=역병 (토마토 역병 정보)`,
  })
  @ApiQuery({
    name: 'cropName',
    required: false,
    description: '작물명 (예: 토마토, 배추, 고추)',
    example: '토마토',
  })
  @ApiQuery({
    name: 'diseaseName',
    required: false,
    description: '병명 (예: 역병, 잎마름병)',
    example: '역병',
  })
  @ApiQuery({
    name: 'displayCount',
    required: false,
    type: Number,
    description: '조회 개수 (기본: 10, 최대: 50)',
    example: 10,
  })
  @ApiQuery({
    name: 'startPoint',
    required: false,
    type: Number,
    description: '시작 위치 (기본: 1)',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '병 정보 검색 성공',
    type: 'array',
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 파라미터' })
  @ApiResponse({ status: 500, description: 'NCPMS API 연동 오류' })
  async searchDiseases(
    @Query() searchDto: DiseaseSearchDto,
  ): Promise<ProcessedDiseaseInfo[]> {
    return this.ncpmsService.searchDiseases(searchDto);
  }

  @Get('pests/search')
  @ApiOperation({
    summary: '해충 정보 검색',
    description: `작물명 또는 해충명으로 해충 정보를 검색합니다.

📋 주요 기능:
• 작물별 발생 가능한 해충 정보 조회
• 해충명으로 직접 검색
• 해충 피해정보, 방제법, 천적곤충 정보 제공
• 병해충 관리시스템 공식 데이터 활용

🔍 검색 예시:
• ?cropName=토마토 (토마토에 발생하는 모든 해충)
• ?pestName=진딧물 (진딧물 관련 정보)
• ?cropName=배추&pestName=배추좀나방 (배추 배추좀나방 정보)`,
  })
  @ApiQuery({
    name: 'cropName',
    required: false,
    description: '작물명 (예: 토마토, 배추, 고추)',
    example: '토마토',
  })
  @ApiQuery({
    name: 'pestName',
    required: false,
    description: '해충명 (예: 진딧물, 배추좀나방)',
    example: '진딧물',
  })
  @ApiQuery({
    name: 'displayCount',
    required: false,
    type: Number,
    description: '조회 개수 (기본: 10, 최대: 50)',
    example: 10,
  })
  @ApiQuery({
    name: 'startPoint',
    required: false,
    type: Number,
    description: '시작 위치 (기본: 1)',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '해충 정보 검색 성공',
    type: 'array',
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 파라미터' })
  @ApiResponse({ status: 500, description: 'NCPMS API 연동 오류' })
  async searchPests(
    @Query() searchDto: PestSearchDto,
  ): Promise<ProcessedPestInfo[]> {
    return this.ncpmsService.searchPests(searchDto);
  }

  @Get('crops/:cropName/health-info')
  @ApiOperation({
    summary: '작물별 종합 병해충 정보',
    description: `특정 작물에 대한 병해충 종합 정보를 제공합니다.

📋 주요 기능:
• 작물별 주요 병 정보 (상위 10개)
• 작물별 주요 해충 정보 (상위 10개)
• 각 병해충별 방제법 및 예방법 제공
• 사용자 작물과 연계된 맞춤형 정보

💡 활용 예시:
• 작물 등록 후 해당 작물의 병해충 정보 확인
• 작물일지 작성 시 주의사항 참고
• 계절별 병해충 관리 계획 수립`,
  })
  @ApiParam({
    name: 'cropName',
    description: '작물명 (등록된 사용자 작물명 권장)',
    example: '토마토',
  })
  @ApiResponse({
    status: 200,
    description: '작물 종합 정보 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: '토마토 병해충 종합 정보를 조회했습니다.',
        },
        data: {
          type: 'object',
          properties: {
            diseases: {
              type: 'array',
              description: '주요 병 정보 (최대 10개)',
            },
            pests: {
              type: 'array',
              description: '주요 해충 정보 (최대 10개)',
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 작물명' })
  @ApiResponse({ status: 500, description: 'NCPMS API 연동 오류' })
  async getCropHealthInfo(@Param('cropName') cropName: string): Promise<{
    diseases: ProcessedDiseaseInfo[];
    pests: ProcessedPestInfo[];
  }> {
    return this.ncpmsService.getCropHealthInfo(cropName);
  }

  @Get('my-crops/health-recommendations')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '내 작물 기반 병해충 추천 정보',
    description: `사용자가 등록한 작물들을 기반으로 병해충 정보를 추천합니다.

📋 주요 기능:
• 등록된 모든 작물의 병해충 정보 통합 제공
• 작물별 현재 시기 주의 병해충 정보
• 개인화된 병해충 관리 가이드
• 작물일지와 연계한 맞춤형 정보

💡 스마트 농업 활용:
• 대시보드에서 한눈에 보는 병해충 현황
• 작물별 예방 스케줄 계획
• 이상 증상 발견 시 빠른 진단 지원`,
  })
  @ApiResponse({
    status: 200,
    description: '개인화 병해충 정보 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: '등록된 3개 작물의 병해충 정보를 조회했습니다.',
        },
        data: {
          type: 'object',
          properties: {
            cropHealthInfo: {
              type: 'array',
              description: '작물별 병해충 정보',
              items: {
                type: 'object',
                properties: {
                  cropName: { type: 'string', example: '토마토' },
                  diseases: { type: 'array', description: '병 정보' },
                  pests: { type: 'array', description: '해충 정보' },
                },
              },
            },
            summary: {
              type: 'object',
              properties: {
                totalCrops: { type: 'number', example: 3 },
                totalDiseases: { type: 'number', example: 25 },
                totalPests: { type: 'number', example: 18 },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 404, description: '등록된 작물이 없음' })
  async getMyHealthRecommendations(
    @GetUser('id') userId: number,
  ): Promise<any> {
    // 사용자가 등록한 작물 목록 조회
    const cropNames = await this.cropsService.getUserCropNames(userId);

    if (cropNames.length === 0) {
      return {
        cropHealthInfo: [],
        summary: {
          totalCrops: 0,
          totalDiseases: 0,
          totalPests: 0,
        },
      };
    }

    // 각 작물별로 병해충 정보 조회
    const cropHealthInfo = await Promise.all(
      cropNames.map(async (cropName) => {
        const [diseases, pests] = await Promise.all([
          this.ncpmsService.searchDiseases({ cropName, displayCount: 5 }),
          this.ncpmsService.searchPests({ cropName, displayCount: 5 }),
        ]);

        return {
          cropName,
          diseases,
          pests,
        };
      }),
    );

    // 요약 정보 계산
    const summary = {
      totalCrops: cropNames.length,
      totalDiseases: cropHealthInfo.reduce(
        (sum, crop) => sum + crop.diseases.length,
        0,
      ),
      totalPests: cropHealthInfo.reduce(
        (sum, crop) => sum + crop.pests.length,
        0,
      ),
    };

    return {
      cropHealthInfo,
      summary,
    };
  }
}
