import { User } from '../../users/entities/user.entity';
import { Crop } from '../../crops/entities/crop.entity';
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

  @Column({ length: 200, comment: '일지 제목' })
  title: string;

  @Column({ type: 'text', nullable: true, comment: '일지 내용' })
  content: string | null;

  @Column({ type: 'date', comment: '일지 작성 날짜' })
  date: Date;

  @Column({ type: 'varchar', nullable: true, comment: '첨부 이미지 경로' })
  image: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Crop, {
    onDelete: 'CASCADE',
    nullable: false,
    eager: false,
  })
  crop: Crop;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
