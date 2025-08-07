import { Log } from '../../logs/entities/log.entity';
import { Crop } from '../../crops/entities/crop.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

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

  @Column({ type: 'varchar', nullable: true })
  profileImage: string;

  @OneToMany(() => Log, (log) => log.user)
  logs: Log[];

  @OneToMany(() => Crop, (crop) => crop.user)
  crops: Crop[];
}
