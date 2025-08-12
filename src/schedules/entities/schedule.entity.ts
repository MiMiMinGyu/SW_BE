import { User } from '../../users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';

@Entity({ name: 'schedules' })
@Index(['user', 'date']) // 사용자별 날짜 검색 최적화
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time', nullable: true })
  time: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'personal',
    comment: '일정 카테고리: personal, farming, meeting, etc.',
  })
  category: string;

  @Column({
    type: 'varchar',
    length: 7,
    default: '#4285f4',
    comment: '캘린더에서 표시될 색상 (hex 코드)',
  })
  color: string;

  @Column({ default: false })
  isCompleted: boolean;

  @ManyToOne(() => User, (user) => user.schedules, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
