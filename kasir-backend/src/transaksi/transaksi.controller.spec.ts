import { Test, TestingModule } from '@nestjs/testing';
import { TransaksiController } from './transaksi.controller.js';
import { TransaksiService } from './transaksi.service.js';

describe('TransaksiController', () => {
  let controller: TransaksiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransaksiController],
      providers: [TransaksiService],
    }).compile();

    controller = module.get<TransaksiController>(TransaksiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
