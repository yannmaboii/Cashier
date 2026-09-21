import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Transaksi, TransaksiItem } from './entities/transaksi.entity.js';
import { Produk } from '../produk/entities/produk.entity.js';
import { CreateTransaksiDto } from './dto/create-transaksi.dto.js';
import { PembayaranService } from '../pembayaran/pembayaran.service.js';
import { SheetsService } from '../sheets/sheets.service.js';

const STATUS_VALID = [
  'menunggu_pembayaran',
  'dibayar',
  'diproses',
  'dikirim',
  'selesai',
  'dibatalkan',
];

const STATUS_BERHASIL = ['dibayar', 'diproses', 'dikirim', 'selesai'];

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
    private sheetsService: SheetsService,
  ) {}

  private syncKeSheets(transaksi: Transaksi) {
    const tanggal = new Date(transaksi.createdAt).toLocaleDateString(
      'id-ID',
      { day: '2-digit', month: '2-digit', year: 'numeric' },
    );

    const rows = transaksi.items.map((item) => {
      const hargaSatuan = Number(item.hargaSatuan);
      const modalSatuan = Number(item.modalSatuan || 0);
      const jumlah = Number(item.jumlah);
      const subtotal = Number(item.subtotal);
      const untung = subtotal - modalSatuan * jumlah;

      return [
        tanggal,
        transaksi.kodeTransaksi || '-',
        item.produk?.nama ?? '-',
        jumlah,
        hargaSatuan,
        modalSatuan,
        subtotal,
        untung,
        transaksi.status,
      ];
    });

    if (rows.length > 0) {
      this.sheetsService.appendRows(rows);
    }
  }

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
        modalSatuan: produk.hargaModal ?? 0,
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

    if (!isCustomerOrder) {
      // Transaksi kasir offline langsung "selesai", sync ke sheet sekarang
      const lengkap = await this.transaksiRepository.findOne({
        where: { id: savedTransaksi.id },
        relations: { items: { produk: true } },
      });
      if (lengkap) this.syncKeSheets(lengkap);
    }

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
    const transaksi = await this.transaksiRepository.findOne({
      where: { id },
      relations: { items: { produk: true } },
    });

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
    const hasil = await this.transaksiRepository.save(transaksi);
    this.syncKeSheets(transaksi);
    return hasil;
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
    const transaksi = await this.transaksiRepository.findOne({
      where: { kodeTransaksi },
      relations: { items: { produk: true } },
    });

    if (!transaksi) {
      return null;
    }

    const statusSebelumnya = transaksi.status;
    transaksi.status = status;
    const hasil = await this.transaksiRepository.save(transaksi);

    if (status === 'dibayar' && statusSebelumnya !== 'dibayar') {
      this.syncKeSheets(transaksi);
    }

    return hasil;
  }

  async rekapDana() {
    const transaksiList = await this.transaksiRepository.find({
      where: { status: In(STATUS_BERHASIL) },
      relations: { items: { produk: true } },
      order: { createdAt: 'DESC' },
    });

    let totalPendapatan = 0;
    let totalModal = 0;

    const rincian = transaksiList.map((t) => {
      let pendapatanTransaksi = 0;
      let modalTransaksi = 0;

      const items = t.items.map((item) => {
        const hargaSatuan = Number(item.hargaSatuan);
        const modalSatuan = Number(item.modalSatuan || 0);
        const jumlah = Number(item.jumlah);
        const subtotal = Number(item.subtotal);
        const modal = modalSatuan * jumlah;
        const untung = subtotal - modal;

        pendapatanTransaksi += subtotal;
        modalTransaksi += modal;

        return {
          produk: item.produk?.nama ?? '-',
          jumlah,
          hargaSatuan,
          modalSatuan,
          subtotal,
          untung,
        };
      });

      totalPendapatan += pendapatanTransaksi;
      totalModal += modalTransaksi;

      return {
        id: t.id,
        kodeTransaksi: t.kodeTransaksi,
        createdAt: t.createdAt,
        status: t.status,
        ongkosKirim: Number(t.ongkosKirim || 0),
        items,
        pendapatanTransaksi,
        modalTransaksi,
        untungTransaksi: pendapatanTransaksi - modalTransaksi,
      };
    });

    return {
      totalPendapatan,
      totalModal,
      totalUntung: totalPendapatan - totalModal,
      transaksi: rincian,
    };
  }

  remove(id: number) {
    return this.transaksiRepository.delete(id);
  }
}