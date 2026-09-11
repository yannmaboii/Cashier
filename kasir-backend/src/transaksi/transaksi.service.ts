import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaksi, TransaksiItem } from './entities/transaksi.entity.js';
import { Produk } from '../produk/entities/produk.entity.js';
import { CreateTransaksiDto } from './dto/create-transaksi.dto.js';

@Injectable()
export class TransaksiService {
  constructor(
    @InjectRepository(Transaksi)
    private transaksiRepository: Repository<Transaksi>,
    @InjectRepository(TransaksiItem)
    private itemRepository: Repository<TransaksiItem>,
    @InjectRepository(Produk)
    private produkRepository: Repository<Produk>,
  ) {}

  async create(createTransaksiDto: CreateTransaksiDto) {
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

    const transaksi = this.transaksiRepository.create({
      total,
      items,
    });

    return this.transaksiRepository.save(transaksi);
  }

  findAll() {
    return this.transaksiRepository.find({
      relations: { items: { produk: true } },
    });
  }

  findOne(id: number) {
    return this.transaksiRepository.findOne({
      where: { id },
      relations: { items: { produk: true } },
    });
  }

  remove(id: number) {
    return this.transaksiRepository.delete(id);
  }
}