import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { OngkirService } from './ongkir.service.js';
import { CekOngkirDto } from './dto/cek-ongkir.dto.js';

@Controller('ongkir')
export class OngkirController {
  constructor(private readonly ongkirService: OngkirService) {}

  @Get('destinasi')
  cariDestinasi(@Query('search') search: string) {
    return this.ongkirService.cariDestinasi(search);
  }

  @Post('cek')
  cekOngkir(@Body() dto: CekOngkirDto) {
    return this.ongkirService.cekOngkir(dto);
  }
}