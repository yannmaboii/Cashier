export class TransaksiItemDto {
  produkId: number;
  jumlah: number;
}

export class CreateTransaksiDto {
  items: TransaksiItemDto[];
  alamatPengiriman?: string;
  metodePembayaran?: string;
  ongkosKirim?: number;
  kurir?: string;
}