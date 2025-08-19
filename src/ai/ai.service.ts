import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';
import { DiseaseInfo } from './interfaces/disease-info.interface';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly geminiApiKey: string;

  constructor(private configService: ConfigService) {
    const key = this.configService.get<string>('GEMINI_API_KEY');
    if (!key) {
      throw new Error('GEMINI_API_KEY가 .env 파일에 설정되지 않았습니다.');
    }
    this.geminiApiKey = key;
  }

  async getDiseasesFromSymptoms(userPrompt: string): Promise<DiseaseInfo[]> {
    const modelName = 'gemini-1.5-flash-latest';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.geminiApiKey}`;

    const jsonSchema = {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          diseaseName: { type: 'STRING' },
          description: { type: 'STRING' },
          solution:    { type: 'STRING' },
        },
        required: ['diseaseName', 'description', 'solution'],
      },
    };

    const prompt = `
      당신은 식물 질병 진단 전문가입니다. 
      사용자가 입력한 작물과 증상을 바탕으로, 가능성이 있는 질병 3가지를 추천해주세요. 
      각 질병에 대해 이름(diseaseName)과 간단한 설명(description), 그리고 해결방법(solution)을 포함하여 JSON 형식으로 응답해야 합니다.
      사용자 입력: "${userPrompt}"
    `;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        response_mime_type: 'application/json',
        response_schema: jsonSchema,
      },
    };

    try {
      this.logger.log(`Gemini API(${modelName})에 진단 요청을 보냅니다...`);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(`Gemini API 에러: ${response.statusText}, ${errorBody}`);
        throw new InternalServerErrorException('AI 모델 응답에 실패했습니다.');
      }

      const data = (await response.json()) as any;
      const jsonText = data.candidates[0].content.parts[0].text;
      const result = JSON.parse(jsonText) as DiseaseInfo[];
      
      this.logger.log('Gemini API로부터 성공적으로 응답을 받았습니다.');
      return result;

    } catch (error) {
      this.logger.error('Gemini 호출 중 예외 발생', error.stack);
      throw new InternalServerErrorException('AI 진단 중 오류가 발생했습니다.');
    }
  }
}