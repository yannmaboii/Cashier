import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProdukService } from './produk.service.js';
import { ProdukController } from './produk.controller.js';
import { Produk } from './entities/produk.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Produk]), AuthModule],
  controllers: [ProdukController],
  providers: [ProdukService],
})
export class ProdukModule {}