import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { PembayaranService } from './pembayaran.service.js';
import { BuatPembayaranDto } from './dto/buat-pembayaran.dto.js';
import { TransaksiService } from '../transaksi/transaksi.service.js';
import * as crypto from 'crypto';

@Controller('pembayaran')
export class PembayaranController {
  constructor(
    private readonly pembayaranService: PembayaranService,
    private readonly transaksiService: TransaksiService,
  ) {}

  @Post('buat')
  buatTransaksi(@Body() dto: BuatPembayaranDto) {
    return this.pembayaranService.buatTransaksi(dto);
  }

  @Post('notifikasi')
  async notifikasi(@Body() body: any) {
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
    } = body;

    const valid = this.pembayaranService.verifikasiSignature(
      order_id,
      status_code,
      gross_amount,
      signature_key,
    );

    if (!valid) {
      throw new BadRequestException('Signature tidak valid');
    }

    let statusBaru: string | null = null;

    if (
      transaction_status === 'settlement' ||
      transaction_status === 'capture'
    ) {
      statusBaru = 'dibayar';
    } else if (transaction_status === 'expire') {
      statusBaru = 'dibatalkan';
    } else if (
      transaction_status === 'cancel' ||
      transaction_status === 'deny'
    ) {
      statusBaru = 'dibatalkan';
    }

    if (statusBaru) {
      await this.transaksiService.updateStatusByKode(order_id, statusBaru);
    }

    return { message: 'OK' };
  }

}