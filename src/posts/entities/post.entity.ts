import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { PostLike } from './post-like.entity';
import { PostTag } from './post-tag.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { PostCategory } from '../enums/post-category.enum';

@Entity({ name: 'posts' })
@Index(['category', 'createdAt'])
@Index(['user', 'createdAt'])
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: PostCategory,
    default: PostCategory.GENERAL,
    comment: '게시글 카테고리: 전체, 질문, 일지, 노하우',
  })
  category: PostCategory;

  @Column({ type: 'text', nullable: true })
  images: string | null;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  commentCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 0, nullable: true })
  price: number | null;

  @Column({ type: 'int', nullable: true })
  maxParticipants: number | null;

  @Column({ type: 'int', default: 0 })
  currentParticipants: number;

  @Column({ type: 'timestamp', nullable: true })
  scheduledDate: Date | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  location: string | null;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post, { cascade: true })
  comments: Comment[];

  @OneToMany(() => PostLike, (postLike) => postLike.post, { cascade: true })
  likes: PostLike[];

  @OneToMany(() => PostTag, (postTag) => postTag.post, { cascade: true })
  postTags: PostTag[];

  @OneToMany(() => Reservation, (reservation) => reservation.post, {
    cascade: true,
  })
  reservations: Reservation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
