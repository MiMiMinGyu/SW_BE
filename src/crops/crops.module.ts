import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CropsService } from './crops.service';
import { CropsController } from './crops.controller';
import { Crop } from './entities/crop.entity';
import { Schedule } from '../schedules/entities/schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Crop, Schedule])],
  controllers: [CropsController],
  providers: [CropsService],
  exports: [CropsService], // NCPMS 모듈에서 사용할 수 있도록 export
})
export class CropsModule {}
