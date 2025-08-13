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
  UseInterceptors,
  UploadedFile,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { LogsService } from './logs.service';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { LogResponseDto, LogListResponseDto } from './dto/log-response.dto';
import { logImageMulterConfig } from '../common/config/multer.config';
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

@ApiTags('Logs')
@ApiBearerAuth()
@Controller('logs')
@UseGuards(AuthGuard('jwt'))
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('image', logImageMulterConfig))
  @ApiCreatedResponse({
    summary: '농사일지 생성',
    description:
      '새로운 농사일지를 생성합니다. 이미지 파일을 선택적으로 첨부할 수 있습니다.',
    type: LogResponseDto,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '농사일지 생성 데이터',
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: '농사일지 내용',
          example: '오늘 토마토에 물을 주고 비료를 주었습니다.',
        },
        cropId: {
          type: 'number',
          description: '관련 작물 ID (선택사항)',
          example: 1,
        },
        image: {
          type: 'string',
          format: 'binary',
          description: '농사일지 이미지 (선택사항)',
        },
      },
      required: ['content'],
    },
  })
  @ApiErrorResponses()
  async create(
    @Body() createLogDto: CreateLogDto,
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<LogResponseDto> {
    return this.logsService.create(createLogDto, req.user as User, file);
  }

  @Get()
  @ApiSuccessResponse({
    summary: '내 농사일지 목록 조회',
    description: '현재 로그인한 사용자의 농사일지 목록을 조회합니다.',
    type: LogListResponseDto,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '페이지 번호 (기본값: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '페이지당 항목 수 (기본값: 20)',
    example: 20,
  })
  @ApiErrorResponses()
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ): Promise<LogListResponseDto> {
    const { logs, total } = await this.logsService.findAllByUser(
      req.user.id,
      page,
      limit,
    );
    return { logs, total };
  }

  @Get(':id')
  @ApiSuccessResponse({
    summary: '특정 농사일지 조회',
    description: 'ID를 통해 특정 농사일지의 상세 정보를 조회합니다.',
    type: LogResponseDto,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: '농사일지 ID',
    example: 1,
  })
  @ApiErrorResponses()
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<LogResponseDto> {
    return this.logsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', logImageMulterConfig))
  @ApiSuccessResponse({
    summary: '농사일지 수정',
    description:
      '자신이 작성한 농사일지를 수정합니다. 이미지도 함께 수정할 수 있습니다.',
    type: LogResponseDto,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: '수정할 농사일지 ID',
    example: 1,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '농사일지 수정 데이터',
    schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: '수정할 농사일지 내용',
          example: '수정된 농사일지 내용입니다.',
        },
        cropId: {
          type: 'number',
          description: '수정할 관련 작물 ID',
          example: 2,
        },
        image: {
          type: 'string',
          format: 'binary',
          description: '새 농사일지 이미지 (선택사항)',
        },
      },
    },
  })
  @ApiErrorResponses()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLogDto: UpdateLogDto,
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<LogResponseDto> {
    return this.logsService.update(id, req.user.id, updateLogDto, file);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiSuccessResponse({
    summary: '농사일지 삭제',
    description: '자신이 작성한 농사일지를 삭제합니다.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: '삭제할 농사일지 ID',
    example: 1,
  })
  @ApiErrorResponses()
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.logsService.remove(id, req.user.id);
  }

  @Get('crop/:cropId')
  @ApiSuccessResponse({
    summary: '특정 작물의 농사일지 조회',
    description: '특정 작물과 관련된 농사일지 목록을 조회합니다.',
    type: LogResponseDto,
    isArray: true,
  })
  @ApiParam({
    name: 'cropId',
    type: Number,
    description: '작물 ID',
    example: 1,
  })
  @ApiErrorResponses()
  async findByCrop(
    @Param('cropId', ParseIntPipe) cropId: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<LogResponseDto[]> {
    return this.logsService.findByCrop(cropId, req.user.id);
  }
}
