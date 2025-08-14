import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { ReservationStatus } from '../enums/reservation-status.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';

@Entity({ name: 'reservations' })
@Index(['user', 'createdAt'])
@Index(['post', 'createdAt'])
@Index(['status'])
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  participantCount: number;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ type: 'text', nullable: true })
  cancelReason: string | null;

  @ManyToOne(() => User, (user) => user.reservations, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Post, (post) => post.reservations, { onDelete: 'CASCADE' })
  post: Post;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
