import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { BuatPembayaranDto } from './dto/buat-pembayaran.dto.js';

@Injectable()
export class PembayaranService {
  private readonly baseUrl = 'https://app.sandbox.midtrans.com/snap/v1/transactions';
  private readonly serverKey = process.env.MIDTRANS_SERVER_KEY;

  async buatTransaksi(dto: BuatPembayaranDto) {
    try {
      const authString = Buffer.from(`${this.serverKey}:`).toString('base64');

      const response = await axios.post(
        this.baseUrl,
        {
          transaction_details: {
            order_id: dto.orderId,
            gross_amount: dto.grossAmount,
          },
          customer_details: {
            first_name: dto.customerName ?? 'Customer',
            email: dto.customerEmail,
          },
        },
        {
          headers: {
            Authorization: `Basic ${authString}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      return response.data;
    } catch (error: any) {
      console.error('MIDTRANS ERROR:', error.response?.data ?? error.message);
      throw new InternalServerErrorException(
        'Gagal membuat transaksi pembayaran Midtrans',
      );
    }
  }

  verifikasiSignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    signatureKey: string,
  ): boolean {
    const raw = orderId + statusCode + grossAmount + this.serverKey;
    const hash = crypto.createHash('sha512').update(raw).digest('hex');
    return hash === signatureKey;
  }
}