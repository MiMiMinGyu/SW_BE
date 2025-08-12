import { Post } from './post.entity';
import { Tag } from '../../tags/entities/tag.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'post_tags' })
@Index(['post', 'tag'], { unique: true })
export class PostTag {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Post, (post) => post.postTags, { onDelete: 'CASCADE' })
  post: Post;

  @ManyToOne(() => Tag, (tag) => tag.postTags, { onDelete: 'CASCADE' })
  tag: Tag;

  @CreateDateColumn()
  createdAt: Date;
}
