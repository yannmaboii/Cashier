import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KategoriService } from './kategori.service.js';
import { KategoriController } from './kategori.controller.js';
import { Kategori } from './entities/kategori.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Kategori]), AuthModule],
  controllers: [KategoriController],
  providers: [KategoriService],
})
export class KategoriModule {}