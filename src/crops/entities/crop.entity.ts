import { User } from '../../users/entities/user.entity';
import { Log } from '../../logs/entities/log.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Crop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 50, nullable: true })
  variety?: string;

  @Column({ type: 'date' })
  plantingDate: Date;

  @Column({ type: 'date', nullable: true })
  expectedHarvestDate?: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'growing',
    enum: ['growing', 'harvested', 'dead'],
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.crops, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => Log, (log) => log.crop)
  logs: Log[];
}
