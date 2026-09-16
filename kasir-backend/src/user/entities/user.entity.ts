import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  username: string | null;

  @Column()
  password: string;

  @Column({ default: 'admin' })
  role: string;
}