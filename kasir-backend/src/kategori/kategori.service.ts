import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kategori } from './entities/kategori.entity.js';
import { CreateKategoriDto } from './dto/create-kategori.dto.js';
import { UpdateKategoriDto } from './dto/update-kategori.dto.js';

@Injectable()
export class KategoriService {
  constructor(
    @InjectRepository(Kategori)
    private kategoriRepository: Repository<Kategori>,
  ) {}

  create(createKategoriDto: CreateKategoriDto) {
    const kategori = this.kategoriRepository.create(createKategoriDto);
    return this.kategoriRepository.save(kategori);
  }

  findAll() {
    return this.kategoriRepository.find();
  }

  findOne(id: number) {
    return this.kategoriRepository.findOneBy({ id });
  }

  update(id: number, updateKategoriDto: UpdateKategoriDto) {
    return this.kategoriRepository.update(id, updateKategoriDto);
  }

  remove(id: number) {
    return this.kategoriRepository.delete(id);
  }
}