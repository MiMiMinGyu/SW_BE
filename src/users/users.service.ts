import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * 사용자 생성을 담당하는 메소드 (회원가입)
   */
  async create(createUserDto: CreateUserDto) {
    const { email, password, nickname } = createUserDto;

    const existingUser = await this.usersRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictException('이미 사용중인 이메일입니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.usersRepository.create({
      email,
      password: hashedPassword,
      nickname,
    });
    
    const savedUser = await this.usersRepository.save(newUser);

    const { password: _, ...result } = savedUser;
    return result;
  }

  /**
   * 모든 사용자 목록을 조회하는 메소드
   * (참고: 실제 서비스에서는 관리자만 사용하도록 권한 제어가 필요합니다)
   */
  async findAll() {
    return this.usersRepository.find();
  }

  /**
   * 이메일을 기준으로 특정 사용자 한 명을 조회하는 메소드
   * (참고: 로그인 기능 구현 시 반드시 필요합니다)
   */
  async findOneByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException('해당 이메일의 사용자를 찾을 수 없습니다.');
    }
    return user;
  }
}