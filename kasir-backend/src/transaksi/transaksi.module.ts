import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransaksiService } from './transaksi.service.js';
import { TransaksiController } from './transaksi.controller.js';
import { Transaksi, TransaksiItem } from './entities/transaksi.entity.js';
import { Produk } from '../produk/entities/produk.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { PembayaranModule } from '../pembayaran/pembayaran.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaksi, TransaksiItem, Produk]),
    AuthModule,
    forwardRef(() => PembayaranModule),
  ],
  controllers: [TransaksiController],
  providers: [TransaksiService],
  exports: [TransaksiService],
})
export class TransaksiModule {}