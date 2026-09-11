import { PartialType } from '@nestjs/mapped-types';
import { CreateTransaksiDto } from './create-transaksi.dto.js';

export class UpdateTransaksiDto extends PartialType(CreateTransaksiDto) {}
