import { Crop } from '../../crops/entities/crop.entity';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { PostLike } from '../../posts/entities/post-like.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserType } from '../enums/user-type.enum';

@Entity({ name: 'users' }) // 테이블 이름 명시
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ select: false }) // 기본 조회에서 제외
  password: string;

  @Column({ length: 50 })
  nickname: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string | null;

  @Column({ type: 'text', nullable: true })
  interestCrops: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profileImage: string | null;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.HOBBY,
  })
  userType: UserType;

  @OneToMany(() => Crop, (crop) => crop.user)
  crops: Crop[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => PostLike, (postLike) => postLike.user)
  postLikes: PostLike[];

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations: Reservation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
