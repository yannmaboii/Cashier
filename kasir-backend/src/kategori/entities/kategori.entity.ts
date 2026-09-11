import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Kategori {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama: string;

  @Column({ nullable: true })
  deskripsi: string;
}