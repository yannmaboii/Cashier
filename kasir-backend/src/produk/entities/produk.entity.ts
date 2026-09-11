import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Produk {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama: string;

  @Column('decimal')
  harga: number;

  @Column()
  stok: number;

  @Column({ nullable: true })
  kategori: string;
}