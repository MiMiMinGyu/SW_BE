import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CropsModule } from '../crops/crops.module';
import { NcpmsService } from './ncpms.service';
import { NcpmsController } from './ncpms.controller';

@Module({
  imports: [ConfigModule, CropsModule],
  providers: [NcpmsService],
  controllers: [NcpmsController],
  exports: [NcpmsService], // 다른 모듈에서 사용할 수 있도록 export
})
export class NcpmsModule {}
