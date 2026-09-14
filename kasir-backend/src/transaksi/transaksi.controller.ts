import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Req,
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

  @Roles('admin', 'kasir', 'customer')
  @Post()
  create(@Body() createTransaksiDto: CreateTransaksiDto, @Req() req: any) {
    return this.transaksiService.create(createTransaksiDto, req.user);
  }

  @Roles('customer')
  @Get('saya')
  findMine(@Req() req: any) {
    return this.transaksiService.findMine(req.user.email);
  }

  @Roles('admin', 'kasir')
  @Get()
  findAll() {
    return this.transaksiService.findAll();
  }

  @Roles('admin', 'kasir', 'customer')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transaksiService.findOne(+id);
  }

  @Roles('customer')
  @Patch(':id/bayar')
  bayar(@Param('id') id: string, @Req() req: any) {
    return this.transaksiService.bayar(+id, req.user.email);
  }

  @Roles('admin', 'kasir')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.transaksiService.updateStatus(+id, body.status);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transaksiService.remove(+id);
  }
}