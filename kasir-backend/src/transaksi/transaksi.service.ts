import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaksi, TransaksiItem } from './entities/transaksi.entity.js';
import { Produk } from '../produk/entities/produk.entity.js';
import { CreateTransaksiDto } from './dto/create-transaksi.dto.js';
import { PembayaranService } from '../pembayaran/pembayaran.service.js';

const STATUS_VALID = [
  'menunggu_pembayaran',
  'dibayar',
  'diproses',
  'dikirim',
  'selesai',
  'dibatalkan',
];

function generateKodeTransaksi(): string {
  const waktu = Date.now().toString(36).toUpperCase();
  const acak = Math.random().toString(36).substring(2, 6).toUpperCase();
  return 'TRX-' + waktu + '-' + acak;
}

@Injectable()
export class TransaksiService {
  constructor(
    @InjectRepository(Transaksi)
    private transaksiRepository: Repository<Transaksi>,
    @InjectRepository(TransaksiItem)
    private itemRepository: Repository<TransaksiItem>,
    @InjectRepository(Produk)
    private produkRepository: Repository<Produk>,
    private pembayaranService: PembayaranService,
  ) {}

  async create(
    createTransaksiDto: CreateTransaksiDto,
    user?: { email: string; role: string },
  ) {
    const items: TransaksiItem[] = [];
    let total = 0;

    for (const itemDto of createTransaksiDto.items) {
      const produk = await this.produkRepository.findOneBy({
        id: itemDto.produkId,
      });

      if (!produk) {
        throw new BadRequestException(
          'Produk dengan id ' + itemDto.produkId + ' tidak ditemukan',
        );
      }

      if (produk.stok < itemDto.jumlah) {
        throw new BadRequestException(
          'Stok ' + produk.nama + ' tidak cukup (sisa ' + produk.stok + ')',
        );
      }

      const subtotal = Number(produk.harga) * itemDto.jumlah;
      total += subtotal;

      const item = this.itemRepository.create({
        produk,
        jumlah: itemDto.jumlah,
        hargaSatuan: produk.harga,
        subtotal,
      });
      items.push(item);

      produk.stok -= itemDto.jumlah;
      await this.produkRepository.save(produk);
    }

    const isCustomerOrder = user?.role === 'customer';
    const ongkosKirim = createTransaksiDto.ongkosKirim ?? 0;

    const transaksi = this.transaksiRepository.create({
      total: total + ongkosKirim,
      ongkosKirim,
      kurir: createTransaksiDto.kurir ?? null,
      items,
      kodeTransaksi: generateKodeTransaksi(),
      status: isCustomerOrder ? 'menunggu_pembayaran' : 'selesai',
      customerEmail: isCustomerOrder ? user.email : null,
      alamatPengiriman: isCustomerOrder
        ? createTransaksiDto.alamatPengiriman
        : null,
      metodePembayaran: isCustomerOrder
        ? createTransaksiDto.metodePembayaran
        : null,
    });

    const savedTransaksi = await this.transaksiRepository.save(transaksi);

    if (isCustomerOrder) {
      const pembayaran = await this.pembayaranService.buatTransaksi({
        orderId: savedTransaksi.kodeTransaksi as string,
        grossAmount: savedTransaksi.total,
        customerEmail: savedTransaksi.customerEmail ?? undefined,
      });

      return {
        ...savedTransaksi,
        snapToken: pembayaran.token,
        redirectUrl: pembayaran.redirect_url,
      };
    }

    return savedTransaksi;
  }

  findAll() {
    return this.transaksiRepository.find({
      relations: { items: { produk: true } },
      order: { createdAt: 'DESC' },
    });
  }

  findMine(email: string) {
    return this.transaksiRepository.find({
      where: { customerEmail: email },
      relations: { items: { produk: true } },
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: number) {
    return this.transaksiRepository.findOne({
      where: { id },
      relations: { items: { produk: true } },
    });
  }

  async bayar(id: number, email: string) {
    const transaksi = await this.transaksiRepository.findOneBy({ id });

    if (!transaksi) {
      throw new NotFoundException('Transaksi tidak ditemukan');
    }

    if (transaksi.customerEmail !== email) {
      throw new ForbiddenException('Ini bukan pesanan kamu');
    }

    if (transaksi.status !== 'menunggu_pembayaran') {
      throw new BadRequestException(
        'Pesanan ini sudah dibayar atau tidak bisa dibayar lagi',
      );
    }

    transaksi.status = 'dibayar';
    return this.transaksiRepository.save(transaksi);
  }

  async updateStatus(id: number, status: string) {
    if (!STATUS_VALID.includes(status)) {
      throw new BadRequestException('Status tidak valid');
    }

    const transaksi = await this.transaksiRepository.findOneBy({ id });

    if (!transaksi) {
      throw new NotFoundException('Transaksi tidak ditemukan');
    }

    transaksi.status = status;
    return this.transaksiRepository.save(transaksi);
  }

  async updateStatusByKode(kodeTransaksi: string, status: string) {
    const transaksi = await this.transaksiRepository.findOneBy({
      kodeTransaksi,
    });

    if (!transaksi) {
      return null;
    }

    transaksi.status = status;
    return this.transaksiRepository.save(transaksi);
  }

  remove(id: number) {
    return this.transaksiRepository.delete(id);
  }
}