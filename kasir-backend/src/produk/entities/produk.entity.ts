import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Produk {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama: string;

  @Column('decimal')
  harga: number;

  @Column({ type: 'decimal', nullable: true })
  hargaModal: number | null;

  @Column()
  stok: number;

  @Column({ nullable: true })
  kategori: string;

  @Column({ type: 'varchar', nullable: true })
  foto: string | null;
}