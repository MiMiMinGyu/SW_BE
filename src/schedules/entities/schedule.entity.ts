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

export enum ScheduleType {
  CROP_DIARY = 'crop_diary',
  PERSONAL = 'personal',
}

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

  @Column({
    type: 'varchar',
    length: 7,
    nullable: true,
    comment: '캘린더 표시 색상 (HEX)',
  })
  color: string | null;

  @Column({
    type: 'enum',
    enum: ScheduleType,
    default: ScheduleType.CROP_DIARY,
    comment: '일정 유형 (현재는 작물 일지만 사용)',
  })
  type: ScheduleType;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Crop, {
    onDelete: 'CASCADE',
    nullable: true, // 개인 일정은 null 가능
    eager: false,
  })
  crop: Crop | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
