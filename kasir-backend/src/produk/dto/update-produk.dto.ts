import { PartialType } from '@nestjs/mapped-types';
import { CreateProdukDto } from './create-produk.dto.js';

export class UpdateProdukDto extends PartialType(CreateProdukDto) {}
