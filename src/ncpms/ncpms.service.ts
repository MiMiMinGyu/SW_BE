import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import {
  DiseaseSearchResponse,
  DiseaseDetailResponse,
  PestSearchResponse,
  PestDetailResponse,
  ProcessedDiseaseInfo,
  ProcessedPestInfo,
} from './interfaces/ncpms-api.interface';
import { DiseaseSearchDto, PestSearchDto } from './dto/disease-search.dto';

@Injectable()
export class NcpmsService {
  private readonly logger = new Logger(NcpmsService.name);
  private readonly baseUrl = 'http://ncpms.rda.go.kr/npmsAPI/service';
  private readonly apiKey = '2025967c55b0456bce9c0ddeea487f12cae9';

  constructor(private readonly configService: ConfigService) {}

  /**
   * 병 검색 API 호출
   */
  async searchDiseases(
    searchDto: DiseaseSearchDto,
  ): Promise<ProcessedDiseaseInfo[]> {
    try {
      const params = {
        apiKey: this.apiKey,
        serviceCode: 'SVC01',
        serviceType: 'AA003:JSON',
        ...(searchDto.cropName && { cropName: searchDto.cropName }),
        ...(searchDto.diseaseName && { sickNameKor: searchDto.diseaseName }),
        displayCount: searchDto.displayCount || 10,
        startPoint: searchDto.startPoint || 1,
      };

      this.logger.log(`병 검색 API 호출: ${JSON.stringify(params)}`);

      const response: AxiosResponse<{ list: DiseaseSearchResponse[] }> =
        await axios.get(this.baseUrl, { params });

      if (!response.data?.list) {
        return [];
      }

      // 병 상세 정보를 각각 조회하여 통합 정보 생성
      const detailedDiseases = await Promise.all(
        response.data.list.map(async (disease) => {
          try {
            const detail = await this.getDiseaseDetail(disease.sickKey);
            return this.processDiseaseData(disease, detail);
          } catch (error) {
            this.logger.warn(
              `병 상세정보 조회 실패 (ID: ${disease.sickKey}): ${error instanceof Error ? error.message : String(error)}`,
            );
            return this.processDiseaseData(disease, undefined);
          }
        }),
      );

      return detailedDiseases;
    } catch (error) {
      this.logger.error(
        `병 검색 API 호출 실패: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new InternalServerErrorException(
        '병해충 정보 조회 중 오류가 발생했습니다.',
      );
    }
  }

  /**
   * 병 상세정보 API 호출
   */
  async getDiseaseDetail(sickKey: number): Promise<DiseaseDetailResponse> {
    try {
      const params = {
        apiKey: this.apiKey,
        serviceCode: 'SVC05',
        sickKey: sickKey,
      };

      const response: AxiosResponse<DiseaseDetailResponse> = await axios.get(
        this.baseUrl,
        { params },
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `병 상세정보 API 호출 실패 (ID: ${sickKey}): ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * 해충 검색 API 호출
   */
  async searchPests(searchDto: PestSearchDto): Promise<ProcessedPestInfo[]> {
    try {
      const params = {
        apiKey: this.apiKey,
        serviceCode: 'SVC03',
        serviceType: 'AA003:JSON',
        ...(searchDto.cropName && { cropName: searchDto.cropName }),
        ...(searchDto.pestName && { insectKorName: searchDto.pestName }),
        displayCount: searchDto.displayCount || 10,
        startPoint: searchDto.startPoint || 1,
      };

      this.logger.log(`해충 검색 API 호출: ${JSON.stringify(params)}`);

      const response: AxiosResponse<{ list: PestSearchResponse[] }> =
        await axios.get(this.baseUrl, { params });

      if (!response.data?.list) {
        return [];
      }

      // 해충 상세 정보를 각각 조회하여 통합 정보 생성
      const detailedPests = await Promise.all(
        response.data.list.map(async (pest) => {
          try {
            const detail = await this.getPestDetail(pest.insectKey);
            return this.processPestData(pest, detail);
          } catch (error) {
            this.logger.warn(
              `해충 상세정보 조회 실패 (ID: ${pest.insectKey}): ${error instanceof Error ? error.message : String(error)}`,
            );
            return this.processPestData(pest, undefined);
          }
        }),
      );

      return detailedPests;
    } catch (error) {
      this.logger.error(
        `해충 검색 API 호출 실패: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new InternalServerErrorException(
        '해충 정보 조회 중 오류가 발생했습니다.',
      );
    }
  }

  /**
   * 해충 상세정보 API 호출
   */
  async getPestDetail(insectKey: number): Promise<PestDetailResponse> {
    try {
      const params = {
        apiKey: this.apiKey,
        serviceCode: 'SVC07',
        insectKey: insectKey,
      };

      const response: AxiosResponse<PestDetailResponse> = await axios.get(
        this.baseUrl,
        { params },
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `해충 상세정보 API 호출 실패 (ID: ${insectKey}): ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * 작물별 병해충 종합 정보 조회
   */
  async getCropHealthInfo(cropName: string): Promise<{
    diseases: ProcessedDiseaseInfo[];
    pests: ProcessedPestInfo[];
  }> {
    try {
      const [diseases, pests] = await Promise.all([
        this.searchDiseases({ cropName, displayCount: 20 }),
        this.searchPests({ cropName, displayCount: 20 }),
      ]);

      return {
        diseases: diseases.slice(0, 10), // 상위 10개만 반환
        pests: pests.slice(0, 10), // 상위 10개만 반환
      };
    } catch (error) {
      this.logger.error(
        `작물 종합 정보 조회 실패: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new InternalServerErrorException(
        '작물 병해충 정보 조회 중 오류가 발생했습니다.',
      );
    }
  }

  /**
   * 병 정보 데이터 정제
   */
  private processDiseaseData(
    disease: DiseaseSearchResponse,
    detail?: DiseaseDetailResponse,
  ): ProcessedDiseaseInfo {
    return {
      id: disease.sickKey,
      cropName: disease.cropName,
      diseaseName: disease.sickNameKor,
      symptoms: detail?.symptoms || '정보 없음',
      preventionMethod: detail?.preventionMethod || '정보 없음',
      biologyPrevention: detail?.biologyPrvnbeMth || '정보 없음',
      chemicalPrevention: detail?.chemicalPrvnbeMth || '정보 없음',
      developmentCondition: detail?.developmentCondition || '정보 없음',
      images: [
        ...(disease.thumbImg
          ? [{ url: disease.thumbImg, title: '대표 이미지' }]
          : []),
        ...(detail?.imageList?.map((img) => ({
          url: img.image,
          title: img.imageTitle || '병해 사진',
        })) || []),
        ...(detail?.virusImgList?.map((img) => ({
          url: img.image,
          title: img.imageTitle || '병원체 사진',
        })) || []),
      ],
    };
  }

  /**
   * 해충 정보 데이터 정제
   */
  private processPestData(
    pest: PestSearchResponse,
    detail?: PestDetailResponse,
  ): ProcessedPestInfo {
    return {
      id: pest.insectKey,
      cropName: pest.cropName,
      pestName: pest.insectKorName,
      scientificName: pest.speciesName,
      damageInfo: detail?.damageInfo || '정보 없음',
      preventMethod: detail?.preventMethod || '정보 없음',
      biologyPrevention: detail?.biologyPrvnbeMth || '정보 없음',
      chemicalPrevention: detail?.chemicalPrvnbeMth || '정보 없음',
      ecologyInfo: detail?.ecologyInfo || '정보 없음',
      enemyInsects: detail?.enemyInsectSpeciesKor || [],
      images: [
        ...(pest.thumbImg
          ? [{ url: pest.thumbImg, title: '대표 이미지' }]
          : []),
        ...(detail?.imageList?.map((img) => ({
          url: img.image,
          title: img.imageTitle || '해충 사진',
        })) || []),
        ...(detail?.spcsPhotoData?.map((img) => ({
          url: img.image,
          title: img.imageTitle || '종 사진',
        })) || []),
      ],
    };
  }
}
