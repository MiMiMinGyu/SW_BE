import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { Log } from './entities/log.entity';
import { Crop } from '../crops/entities/crop.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Log, Crop]), // Crop 엔티티 추가
  ],
  controllers: [LogsController],
  providers: [LogsService],
  exports: [LogsService], // 다른 모듈에서 LogsService 사용 가능
})
export class LogsModule {}
