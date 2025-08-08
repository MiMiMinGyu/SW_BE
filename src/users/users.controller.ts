import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')  //이 파일에 모든 기본적인 주소 설정 코드
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //회원가입
  @Post()   //기본적인 주소에 세부 경로
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  //로그인
  @Post('login')    //login이라는 세부 경로
  login(@Body() loginUserDto: LoginUserDto) {
    return this.usersService.login(loginUserDto.email, loginUserDto.password);
  }

  //사용자 정보 조회
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Req() req) {
    const { password, ...result } = req.user;
    return result;
  }

  //사용자 정보 수정
  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  //프로필 이미지 업로드 기능
  @UseGuards(AuthGuard('jwt'))
  @Post('me/image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          const filename = `${path.basename(
            file.originalname,
            ext,
          )}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  uploadProfileImage(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('이미지 파일이 없습니다.');
    }

    console.log('Multer가 전달한 파일 정보:', file);

    return this.usersService.uploadProfileImage(req.user.id, file.path);
  }
}
