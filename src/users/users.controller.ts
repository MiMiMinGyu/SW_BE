import { Controller, Post, Body, Get, Patch, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 회원가입
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // 로그인
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.usersService.login(loginUserDto.email, loginUserDto.password);
  }

  //로그인된 사용자의 정보 조회
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Req() req) {
    const { password, ...result } = req.user;
    return result;
  }

  //로그인된 사용자의 정보 수정
  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }
}