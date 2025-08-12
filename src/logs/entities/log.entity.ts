import { User } from '../../users/entities/user.entity';
import { Crop } from '../../crops/entities/crop.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.logs, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'varchar', nullable: true })
  image: string | null;

  @ManyToOne(() => Crop, (crop) => crop.logs, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  crop: Crop | null;
}
