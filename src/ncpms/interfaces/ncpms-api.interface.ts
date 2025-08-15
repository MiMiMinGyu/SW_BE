// 병 검색 API 응답
export interface DiseaseSearchResponse {
  buildTime: string;
  totalCount: number;
  startPoint: number;
  displayCount: number;
  cropName: string;
  sickNameKor: string;
  sickNameChn: string;
  sickNameEng: string;
  thumbImg: string;
  oriImg: string;
  sickKey: number;
}

// 병 상세정보 API 응답
export interface DiseaseDetailResponse {
  buildTime: string;
  cropName: string;
  sickNameKor: string;
  sickNameChn: string;
  sickNameEng: string;
  infectionRoute: string;
  developmentCondition: string;
  symptoms: string;
  preventionMethod: string;
  biologyPrvnbeMth: string;
  chemicalPrvnbeMth: string;
  etc: string;
  virusName: string;
  sfeNm: string;
  virusImgList: Array<{
    image: string;
    imageTitle: string;
  }>;
  imageList: Array<{
    image: string;
    imageTitle: string;
    iemSpchcknNm: string;
  }>;
}

// 해충 검색 API 응답
export interface PestSearchResponse {
  buildTime: string;
  totalCount: number;
  startPoint: number;
  displayCount: number;
  cropName: string;
  insectKorName: string;
  speciesName: string;
  thumbImg: string;
  oriImg: string;
  insectKey: number;
}

// 해충 상세정보 API 응답
export interface PestDetailResponse {
  buildTime: string;
  cropName: string;
  insectOrder: string;
  insectGenus: string;
  insectFamily: string;
  insectSpecies: string;
  insectSpeciesKor: string;
  insectSubspecies: string;
  insectSubgenus: string;
  insectAuthor: string;
  authYear: string;
  distrbInfo: string;
  stleInfo: string;
  qrantInfo: string;
  spcsPhotoData: Array<{
    image: string;
    imageTitle: string;
  }>;
  ecologyInfo: string;
  damageInfo: string;
  preventMethod: string;
  biologyPrvnbeMth: string;
  chemicalPrvnbeMth: string;
  insectLink: string;
  imageList: Array<{
    image: string;
    imageTitle: string;
    iemSpchcknNm: string;
  }>;
  insectKey: string;
  enemyInsectSpeciesKor: Array<string>;
  enemyInsectSpecies: Array<string>;
  enemyInsectOrder: Array<string>;
  enemyInsectFamily: Array<string>;
  enemyImage: Array<string>;
}

// NCPMS API 공통 요청 인터페이스
export interface NCPMSRequest {
  apiKey: string;
  serviceCode: string;
  serviceType: string;
}

// 정제된 병해충 정보 응답
export interface ProcessedDiseaseInfo {
  id: number;
  cropName: string;
  diseaseName: string;
  symptoms: string;
  preventionMethod: string;
  biologyPrevention: string;
  chemicalPrevention: string;
  images: Array<{
    url: string;
    title: string;
  }>;
  developmentCondition: string;
}

export interface ProcessedPestInfo {
  id: number;
  cropName: string;
  pestName: string;
  scientificName: string;
  damageInfo: string;
  preventMethod: string;
  biologyPrevention: string;
  chemicalPrevention: string;
  images: Array<{
    url: string;
    title: string;
  }>;
  ecologyInfo: string;
  enemyInsects: Array<string>;
}
