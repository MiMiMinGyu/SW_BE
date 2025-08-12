import { PostTag } from '../../posts/entities/post-tag.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'tags' })
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ default: 0 })
  usageCount: number;

  @Column({ type: 'varchar', length: 7, default: '#4CAF50' })
  color: string;

  @OneToMany(() => PostTag, (postTag) => postTag.tag)
  postTags: PostTag[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}