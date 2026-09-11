export class TransaksiItemDto {
  produkId: number;
  jumlah: number;
}

export class CreateTransaksiDto {
  items: TransaksiItemDto[];
}