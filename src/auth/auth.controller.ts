import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import {
  ApiCreatedResponse,
  ApiSuccessResponse,
  ApiErrorResponses,
} from '../common/decorators/api-response.decorator';

// 인증된 요청에서 사용자 정보 타입
interface AuthenticatedRequest extends Request {
  user: Omit<User, 'password'>;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    summary: '회원가입',
    description:
      '이메일, 비밀번호, 닉네임, 사용자 타입을 입력하여 새 계정을 생성합니다.',
    type: UserResponseDto,
  })
  @ApiBody({
    type: CreateUserDto,
    description: '회원가입에 필요한 사용자 정보',
  })
  @ApiErrorResponses()
  async signup(
    @Body() createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password'>> {
    return this.authService.signup(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiSuccessResponse({
    summary: '로그인',
    description: '이메일과 비밀번호를 사용하여 JWT 액세스 토큰을 발급받습니다.',
    type: LoginResponseDto,
  })
  @ApiBody({
    type: LoginUserDto,
    description: '로그인에 필요한 사용자 인증 정보',
  })
  @ApiErrorResponses()
  async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponseDto> {
    return this.authService.login(loginUserDto.email, loginUserDto.password);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiSuccessResponse({
    summary: '현재 사용자 정보 조회',
    description:
      'JWT 토큰을 사용하여 현재 로그인한 사용자의 정보를 조회합니다.',
    type: UserResponseDto,
  })
  @ApiErrorResponses()
  getCurrentUser(@Req() req: AuthenticatedRequest): Omit<User, 'password'> {
    return req.user;
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiSuccessResponse({
    summary: '로그아웃',
    description:
      '현재 세션을 종료합니다. 클라이언트에서 토큰을 삭제해야 합니다.',
  })
  @ApiErrorResponses()
  logout(): { message: string } {
    return { message: '로그아웃되었습니다.' };
  }
}
