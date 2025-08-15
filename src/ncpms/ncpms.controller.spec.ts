import { Test, TestingModule } from '@nestjs/testing';
import { NcpmsController } from './ncpms.controller';

describe('NcpmsController', () => {
  let controller: NcpmsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NcpmsController],
    }).compile();

    controller = module.get<NcpmsController>(NcpmsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
