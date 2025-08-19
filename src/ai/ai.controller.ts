import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AiService } from './ai.service';
import { SymptomCheckDto } from './dto/symptom-check.dto';
import { DiseaseInfo } from './interfaces/disease-info.interface';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('symptom-check')
  @UsePipes(new ValidationPipe())
  async checkSymptoms(
    @Body() symptomCheckDto: SymptomCheckDto,
  ): Promise<DiseaseInfo[]> {
    const { prompt } = symptomCheckDto;
    return this.aiService.getDiseasesFromSymptoms(prompt);
  }
}
