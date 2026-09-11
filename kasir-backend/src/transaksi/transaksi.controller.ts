import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TransaksiService } from './transaksi.service.js';
import { CreateTransaksiDto } from './dto/create-transaksi.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('transaksi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransaksiController {
  constructor(private readonly transaksiService: TransaksiService) {}

  @Roles('admin', 'kasir')
  @Post()
  create(@Body() createTransaksiDto: CreateTransaksiDto) {
    return this.transaksiService.create(createTransaksiDto);
  }

  @Roles('admin', 'kasir')
  @Get()
  findAll() {
    return this.transaksiService.findAll();
  }

  @Roles('admin', 'kasir')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transaksiService.findOne(+id);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transaksiService.remove(+id);
  }
}