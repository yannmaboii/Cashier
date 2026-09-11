import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
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
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.produkService.remove(+id);
  }
}