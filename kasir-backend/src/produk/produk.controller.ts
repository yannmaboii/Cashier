import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProdukService } from './produk.service.js';
import { CreateProdukDto } from './dto/create-produk.dto.js';
import { UpdateProdukDto } from './dto/update-produk.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('produk')
export class ProdukController {
  constructor(private readonly produkService: ProdukService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gudang')
  @Post()
  create(@Body() createProdukDto: CreateProdukDto) {
    return this.produkService.create(createProdukDto);
  }

  @Get()
  findAll() {
    return this.produkService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produkService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gudang')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProdukDto: UpdateProdukDto) {
    return this.produkService.update(+id, updateProdukDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gudang')
  @Post(':id/foto')
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: './uploads/produk',
        filename: (req, file, callback) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, unique + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(
            new Error('Hanya file gambar (jpg, png, webp) yang diizinkan'),
            false,
          );
        }
        callback(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  uploadFoto(@Param('id') id: string, @UploadedFile() file: any) {
    return this.produkService.updateFoto(
      +id,
      '/uploads/produk/' + file.filename,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gudang')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.produkService.remove(+id);
  }
}