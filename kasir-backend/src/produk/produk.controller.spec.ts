import { Test, TestingModule } from '@nestjs/testing';
import { ProdukController } from './produk.controller.js';
import { ProdukService } from './produk.service.js';

describe('ProdukController', () => {
  let controller: ProdukController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProdukController],
      providers: [ProdukService],
    }).compile();

    controller = module.get<ProdukController>(ProdukController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
