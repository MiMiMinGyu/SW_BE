import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { CropsService } from './crops.service';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';
import { CropResponseDto } from './dto/crop-response.dto';
import { User } from '../users/entities/user.entity';
import {
  ApiCreatedResponse,
  ApiSuccessResponse,
  ApiErrorResponses,
} from '../common/decorators/api-response.decorator';

// 인증된 요청에서 사용자 정보 타입
interface AuthenticatedRequest extends Request {
  user: Omit<User, 'password'>;
}

@ApiTags('Crops')
@ApiBearerAuth()
@Controller('crops')
@UseGuards(AuthGuard('jwt'))
export class CropsController {
  constructor(private readonly cropsService: CropsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    summary: '작물 등록',
    description: '새로운 작물을 등록합니다.',
    type: CropResponseDto,
  })
  @ApiErrorResponses()
  async create(
    @Body() createCropDto: CreateCropDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<CropResponseDto> {
    return this.cropsService.create(createCropDto, req.user as User);
  }

  @Get()
  @ApiSuccessResponse({
    summary: '내 작물 목록 조회',
    description: '현재 로그인한 사용자의 작물 목록을 조회합니다.',
    type: CropResponseDto,
    isArray: true,
  })
  @ApiErrorResponses()
  async findAll(@Req() req: AuthenticatedRequest): Promise<CropResponseDto[]> {
    return this.cropsService.findAllByUser(req.user.id);
  }

  @Get(':id')
  @ApiSuccessResponse({
    summary: '특정 작물 조회',
    description: 'ID를 통해 특정 작물의 상세 정보를 조회합니다.',
    type: CropResponseDto,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: '작물 ID',
    example: 1,
  })
  @ApiErrorResponses()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<CropResponseDto> {
    return this.cropsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiSuccessResponse({
    summary: '작물 정보 수정',
    description: '자신이 등록한 작물의 정보를 수정합니다.',
    type: CropResponseDto,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: '수정할 작물 ID',
    example: 1,
  })
  @ApiErrorResponses()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCropDto: UpdateCropDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<CropResponseDto> {
    return this.cropsService.update(id, req.user.id, updateCropDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiSuccessResponse({
    summary: '작물 삭제',
    description: '자신이 등록한 작물을 삭제합니다.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: '삭제할 작물 ID',
    example: 1,
  })
  @ApiErrorResponses()
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.cropsService.remove(id, req.user.id);
  }
}
