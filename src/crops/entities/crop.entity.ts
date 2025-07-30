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

  @Column()
  name: string;

  @CreateDateColumn()
  plantingDate: Date;

  @ManyToOne(() => User, (user) => user.crops, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => Log, (log) => log.crop)
  logs: Log[];
}