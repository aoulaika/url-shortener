import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('urls')
export class Url {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, nullable: true })
  shortCode: string | null;

  @Column('text')
  longUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: 0 })
  clicks: number;
}
