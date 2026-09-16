import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { CekOngkirDto } from './dto/cek-ongkir.dto.js';

@Injectable()
export class OngkirService {
  private readonly baseUrl = process.env.RAJAONGKIR_BASE_URL;
  private readonly apiKey = process.env.RAJAONGKIR_API_KEY;

  async cariDestinasi(search: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/destination/domestic-destination`,
        {
          params: { search, limit: 20, offset: 0 },
          headers: { key: this.apiKey },
        },
      );
      return response.data;
    } catch (error) {
      throw new InternalServerErrorException(
        'Gagal mencari destinasi dari RajaOngkir',
      );
    }
  }

  async cekOngkir(dto: CekOngkirDto) {
    try {
      const params = new URLSearchParams();
      params.append('origin', String(dto.origin));
      params.append('destination', String(dto.destination));
      params.append('weight', String(dto.weight));
      params.append('courier', dto.courier);
      params.append('price', dto.price ?? 'lowest');

      const response = await axios.post(
        `${this.baseUrl}/calculate/domestic-cost`,
        params,
        {
          headers: {
            key: this.apiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new InternalServerErrorException(
        'Gagal menghitung ongkos kirim',
      );
    }
  }
}