import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produk } from './entities/produk.entity.js';
import { CreateProdukDto } from './dto/create-produk.dto.js';
import { UpdateProdukDto } from './dto/update-produk.dto.js';

@Injectable()
export class ProdukService {
  constructor(
    @InjectRepository(Produk)
    private produkRepository: Repository<Produk>,
  ) {}

  create(createProdukDto: CreateProdukDto) {
    const produk = this.produkRepository.create(createProdukDto);
    return this.produkRepository.save(produk);
  }

  findAll() {
    return this.produkRepository.find();
  }

  findOne(id: number) {
    return this.produkRepository.findOneBy({ id });
  }

  update(id: number, updateProdukDto: UpdateProdukDto) {
    return this.produkRepository.update(id, updateProdukDto);
  }

  remove(id: number) {
    return this.produkRepository.delete(id);
  }
}