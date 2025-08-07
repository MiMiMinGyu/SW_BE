import { Log } from '../../logs/entities/log.entity';
import { Crop } from '../../crops/entities/crop.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';

export enum UserType {
  EXPERT = 'EXPERT',
  HOBBY = 'HOBBY',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  nickname: string;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.HOBBY,  //기본값 취미반
  })
  userType: UserType;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Log, (log) => log.user)
  logs: Log[];

  @OneToMany(() => Crop, (crop) => crop.user)
  crops: Crop[];
}