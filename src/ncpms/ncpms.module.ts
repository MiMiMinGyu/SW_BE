import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CropsModule } from '../crops/crops.module';
import { NcpmsService } from './ncpms.service';
import { NcpmsController } from './ncpms.controller';

@Module({
  imports: [ConfigModule, CropsModule, HttpModule],
  providers: [NcpmsService],
  controllers: [NcpmsController],
  exports: [NcpmsService],
})
export class NcpmsModule {}
