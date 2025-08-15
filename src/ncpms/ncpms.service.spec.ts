import { Test, TestingModule } from '@nestjs/testing';
import { NcpmsService } from './ncpms.service';

describe('NcpmsService', () => {
  let service: NcpmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NcpmsService],
    }).compile();

    service = module.get<NcpmsService>(NcpmsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
