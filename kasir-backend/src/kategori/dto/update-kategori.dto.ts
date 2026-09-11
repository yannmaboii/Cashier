import { PartialType } from '@nestjs/mapped-types';
import { CreateKategoriDto } from './create-kategori.dto.js';

export class UpdateKategoriDto extends PartialType(CreateKategoriDto) {}
