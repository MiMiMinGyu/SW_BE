import { Log } from '../../logs/entities/log.entity';
import { Crop } from '../../crops/entities/crop.entity';
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

  @OneToMany(() => Log, (log) => log.user)
  logs: Log[];

  @OneToMany(() => Crop, (crop) => crop.user)
  crops: Crop[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
