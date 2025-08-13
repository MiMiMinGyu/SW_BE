import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import {
  ScheduleResponseDto,
  ScheduleListResponseDto,
} from './dto/schedule-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { logImageMulterConfig } from '../common/config/multer.config';

@ApiTags('작물일지 관리')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('crop-diaries')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', logImageMulterConfig))
  @ApiOperation({
    summary: '새 작물일지 생성',
    description: '사용자의 새로운 작물일지를 생성합니다. 이미지를 첨부할 수 있습니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '작물일지 생성 데이터',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: '토마토 씨앗 파종' },
        content: { type: 'string', example: '오늘 토마토 씨앗을 파종했습니다.' },
        date: { type: 'string', example: '2025-08-15' },
        cropId: { type: 'number', example: 1 },
        image: {
          type: 'string',
          format: 'binary',
          description: '일지 이미지 파일 (JPEG, PNG, WebP, 최대 5MB)',
        },
      },
      required: ['title', 'date', 'cropId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: '작물일지가 성공적으로 생성되었습니다.',
    type: ApiResponseDto<ScheduleResponseDto>,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 404, description: '작물을 찾을 수 없습니다' })
  async create(
    @Body() createScheduleDto: CreateScheduleDto,
    @GetUser('id') userId: number,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApiResponseDto<ScheduleResponseDto>> {
    const imageUrl = file ? `/uploads/logs/${file.filename}` : undefined;
    const data = await this.schedulesService.create(createScheduleDto, userId, imageUrl);
    return {
      success: true,
      message: '작물일지가 성공적으로 생성되었습니다.',
      data,
    };
  }

  @Get()
  @ApiOperation({
    summary: '작물일지 목록 조회',
    description: '사용자의 모든 작물일지를 조회합니다. 특정 작물의 일지만 조회할 수도 있습니다.',
  })
  @ApiQuery({
    name: 'cropId',
    description: '작물 ID (선택사항)',
    required: false,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '작물일지 목록 조회 성공',
    type: ApiResponseDto<ScheduleListResponseDto>,
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async findAll(
    @GetUser('id') userId: number,
    @Query('cropId') cropId?: string,
  ): Promise<ApiResponseDto<ScheduleListResponseDto>> {
    const parsedCropId = cropId ? parseInt(cropId, 10) : undefined;
    const schedules = await this.schedulesService.findAll(userId, parsedCropId);
    return {
      success: true,
      message: '작물일지 목록을 성공적으로 조회했습니다.',
      data: {
        schedules,
        total: schedules.length,
      },
    };
  }

  @Get('date-range')
  @ApiOperation({
    summary: '날짜 범위로 작물일지 조회',
    description:
      '지정된 날짜 범위 내의 작물일지들을 조회합니다. React-calendar 월별 조회에 최적화되어 있습니다.',
  })
  @ApiQuery({
    name: 'startDate',
    description: '시작 날짜 (YYYY-MM-DD)',
    example: '2025-08-01',
  })
  @ApiQuery({
    name: 'endDate',
    description: '종료 날짜 (YYYY-MM-DD)',
    example: '2025-08-31',
  })
  @ApiQuery({
    name: 'cropId',
    description: '작물 ID (선택사항)',
    required: false,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '날짜 범위 작물일지 조회 성공',
    type: ApiResponseDto<ScheduleListResponseDto>,
  })
  @ApiResponse({ status: 400, description: '잘못된 날짜 형식' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @GetUser('id') userId: number,
    @Query('cropId') cropId?: string,
  ): Promise<ApiResponseDto<ScheduleListResponseDto>> {
    const parsedCropId = cropId ? parseInt(cropId, 10) : undefined;
    const schedules = await this.schedulesService.findByDateRange(
      userId,
      startDate,
      endDate,
      parsedCropId,
    );
    return {
      success: true,
      message: '날짜 범위 작물일지를 성공적으로 조회했습니다.',
      data: {
        schedules,
        total: schedules.length,
      },
    };
  }

  @Get('date/:date')
  @ApiOperation({
    summary: '특정 날짜 작물일지 조회',
    description: '특정 날짜의 모든 작물일지를 조회합니다.',
  })
  @ApiParam({
    name: 'date',
    description: '조회할 날짜 (YYYY-MM-DD)',
    example: '2025-08-15',
  })
  @ApiQuery({
    name: 'cropId',
    description: '작물 ID (선택사항)',
    required: false,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '특정 날짜 작물일지 조회 성공',
    type: ApiResponseDto<ScheduleListResponseDto>,
  })
  @ApiResponse({ status: 400, description: '잘못된 날짜 형식' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async findByDate(
    @Param('date') date: string,
    @GetUser('id') userId: number,
    @Query('cropId') cropId?: string,
  ): Promise<ApiResponseDto<ScheduleListResponseDto>> {
    const parsedCropId = cropId ? parseInt(cropId, 10) : undefined;
    const schedules = await this.schedulesService.findByDate(userId, date, parsedCropId);
    return {
      success: true,
      message: '특정 날짜 작물일지를 성공적으로 조회했습니다.',
      data: {
        schedules,
        total: schedules.length,
      },
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: '특정 작물일지 조회',
    description: 'ID로 특정 작물일지의 상세 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '조회할 작물일지의 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '작물일지 조회 성공',
    type: ApiResponseDto<ScheduleResponseDto>,
  })
  @ApiResponse({ status: 404, description: '작물일지를 찾을 수 없음' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponseDto<ScheduleResponseDto>> {
    const data = await this.schedulesService.findOneById(id);
    return {
      success: true,
      message: '작물일지를 성공적으로 조회했습니다.',
      data,
    };
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', logImageMulterConfig))
  @ApiOperation({
    summary: '작물일지 수정',
    description: '기존 작물일지의 정보를 수정합니다. 이미지를 새로 첨부할 수 있습니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '작물일지 수정 데이터',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: '토마토 물주기' },
        content: { type: 'string', example: '수정된 일지 내용입니다.' },
        date: { type: 'string', example: '2025-08-20' },
        cropId: { type: 'number', example: 1 },
        image: {
          type: 'string',
          format: 'binary',
          description: '새 일지 이미지 파일 (JPEG, PNG, WebP, 최대 5MB)',
        },
      },
    },
  })
  @ApiParam({
    name: 'id',
    description: '수정할 작물일지의 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '작물일지 수정 성공',
    type: ApiResponseDto<ScheduleResponseDto>,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 404, description: '작물일지를 찾을 수 없음' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @GetUser('id') userId: number,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApiResponseDto<ScheduleResponseDto>> {
    const imageUrl = file ? `/uploads/logs/${file.filename}` : undefined;
    const data = await this.schedulesService.update(
      id,
      updateScheduleDto,
      userId,
      imageUrl,
    );
    return {
      success: true,
      message: '작물일지가 성공적으로 수정되었습니다.',
      data,
    };
  }


  @Delete(':id')
  @ApiOperation({
    summary: '작물일지 삭제',
    description: '특정 작물일지를 삭제합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '삭제할 작물일지의 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '작물일지 삭제 성공',
    type: ApiResponseDto<null>,
  })
  @ApiResponse({ status: 404, description: '작물일지를 찾을 수 없음' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ): Promise<ApiResponseDto<null>> {
    await this.schedulesService.remove(id, userId);
    return {
      success: true,
      message: '작물일지가 성공적으로 삭제되었습니다.',
      data: null,
    };
  }
}
