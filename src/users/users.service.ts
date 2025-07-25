import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  //회원가입
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
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

    // 보안을 위해 비밀번호를 제외하고 반환
    const { password: _, ...result } = savedUser;
    return result;
  }

  //로그인
  async login(
    email: string,
    pass: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException('존재하지 않는 이메일입니다.');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    //JWT 페이로드 생성
    const payload = { sub: user.id, email: user.email };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}