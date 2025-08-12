import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';

@Entity({ name: 'comments' })
@Index(['post', 'createdAt'])
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: 0 })
  likeCount: number;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  post: Post;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}