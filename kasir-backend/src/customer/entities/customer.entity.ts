import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama: string;

  @Column({ nullable: true })
  telepon: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  alamat: string | null;

  @Column({ type: 'varchar', nullable: true })
  foto: string | null;
}