import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //회원가입
  @Post()
  create(@Body() createPostDto: CreateUserDto) {
    return this.usersService.create(createPostDto);
  }

  //로그인
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.usersService.login(loginUserDto.email, loginUserDto.password);
  }
}