import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // 1. TypeOrmModule 불러오기
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity'; // 2. User 엔티티 불러오기

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // 3. 이 부분이 핵심입니다!
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}