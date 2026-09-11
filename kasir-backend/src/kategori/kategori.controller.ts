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
import { KategoriService } from './kategori.service.js';
import { CreateKategoriDto } from './dto/create-kategori.dto.js';
import { UpdateKategoriDto } from './dto/update-kategori.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('kategori')
export class KategoriController {
  constructor(private readonly kategoriService: KategoriService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gudang')
  @Post()
  create(@Body() createKategoriDto: CreateKategoriDto) {
    return this.kategoriService.create(createKategoriDto);
  }

  @Get()
  findAll() {
    return this.kategoriService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kategoriService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gudang')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateKategoriDto: UpdateKategoriDto,
  ) {
    return this.kategoriService.update(+id, updateKategoriDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'gudang')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kategoriService.remove(+id);
  }
}