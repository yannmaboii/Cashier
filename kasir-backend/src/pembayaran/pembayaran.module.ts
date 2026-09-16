import { Module, forwardRef } from '@nestjs/common';
import { PembayaranService } from './pembayaran.service.js';
import { PembayaranController } from './pembayaran.controller.js';
import { TransaksiModule } from '../transaksi/transaksi.module.js';

@Module({
  imports: [forwardRef(() => TransaksiModule)],
  controllers: [PembayaranController],
  providers: [PembayaranService],
  exports: [PembayaranService],
})
export class PembayaranModule {}