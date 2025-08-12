import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserResponseDto } from './dto/user-response.dto';
import { profileImageMulterConfig } from '../common/config/multer.config';

// 인증된 요청에서 사용자 정보 타입
interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
  };
}

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @ApiOperation({ summary: '내 프로필 조회' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '현재 로그인한 사용자 정보 반환',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증되지 않은 사용자',
  })
  async getProfile(
    @Req() req: AuthenticatedRequest,
  ): Promise<Omit<User, 'password'>> {
    const { id } = req.user;
    const user = await this.usersService.findSafeById(id);

    if (!user) {
      throw new BadRequestException('사용자 정보를 찾을 수 없습니다.');
    }

    return user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  @ApiOperation({ summary: '내 프로필 수정' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '수정된 사용자 정보 반환',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증되지 않은 사용자',
  })
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const { id } = req.user;
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('me/image')
  @ApiOperation({ summary: '프로필 이미지 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '프로필 이미지 파일',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: '이미지 파일 (JPEG, PNG, WebP, 최대 5MB)',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '프로필 이미지가 성공적으로 업로드됨',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '잘못된 파일 형식 또는 파일 크기 초과',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증되지 않은 사용자',
  })
  @UseInterceptors(FileInterceptor('image', profileImageMulterConfig))
  async uploadProfileImage(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Omit<User, 'password'>> {
    if (!file) {
      throw new BadRequestException('이미지 파일이 필요합니다.');
    }

    const { id } = req.user;
    const imageUrl = `/uploads/${file.filename}`; // 상대 경로로 저장

    return this.usersService.uploadProfileImage(id, imageUrl);
  }
}
