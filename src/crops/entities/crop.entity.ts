import { User } from '../../users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
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

  @Column({ type: 'boolean', default: false, comment: '공통 캘린더용 작물 여부' })
  isCommon: boolean;

  @Column({ type: 'varchar', length: 7, default: '#4CAF50', comment: '작물 표시 색상 (HEX)' })
  color: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.crops, { onDelete: 'CASCADE' })
  user: User;
}
