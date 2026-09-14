import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { Produk } from '../../produk/entities/produk.entity.js';

@Entity()
export class Transaksi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, unique: true })
  kodeTransaksi: string;

  @Column('decimal')
  total: number;

  @Column({ default: 'selesai' })
  status: string;

  @Column({ nullable: true })
  customerEmail: string;

  @Column({ nullable: true })
  alamatPengiriman: string;

  @Column({ nullable: true })
  metodePembayaran: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => TransaksiItem, (item) => item.transaksi, {
    cascade: true,
  })
  items: TransaksiItem[];
}

@Entity()
export class TransaksiItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Transaksi, (transaksi) => transaksi.items, {
    onDelete: 'CASCADE',
  })
  transaksi: Transaksi;

  @ManyToOne(() => Produk, { onDelete: 'CASCADE' })
  produk: Produk;

  @Column()
  jumlah: number;

  @Column('decimal')
  hargaSatuan: number;

  @Column('decimal')
  subtotal: number;
}