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
import { UpdateColorDto } from './dto/update-color.dto';
import {
  ScheduleResponseDto,
  ScheduleListResponseDto,
} from './dto/schedule-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../common/decorators/get-user.decorator';
import { logImageMulterConfig } from '../common/config/multer.config';

@ApiTags('7. Schedule - 작물일지 관리')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', logImageMulterConfig))
  @ApiOperation({
    summary: '새 작물일지 생성',
    description:
      '사용자의 새로운 작물일지를 생성합니다. 이미지를 첨부할 수 있습니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '작물일지 생성 데이터',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: '토마토 씨앗 파종' },
        content: {
          type: 'string',
          example: '오늘 토마토 씨앗을 파종했습니다.',
        },
        date: { type: 'string', example: '2025-08-15' },
        cropId: {
          type: 'number',
          example: 1,
          description: '작물 ID (필수)',
        },
        color: {
          type: 'string',
          example: '#4CAF50',
          description: '캘린더 표시 색상 (HEX 코드, 선택사항)',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: '작물일지 이미지 파일 (JPEG, PNG, WebP, 최대 5MB)',
        },
      },
      required: ['title', 'date', 'cropId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: '작물일지가 성공적으로 생성되었습니다.',
    type: ScheduleResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 404, description: '작물을 찾을 수 없습니다' })
  async create(
    @Body() createScheduleDto: CreateScheduleDto,
    @GetUser('id') userId: number,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ScheduleResponseDto> {
    const imageUrl = file ? `/uploads/logs/${file.filename}` : undefined;
    return this.schedulesService.create(createScheduleDto, userId, imageUrl);
  }

  @Get()
  @ApiOperation({
    summary: '작물일지 목록 조회',
    description:
      '사용자의 모든 작물일지를 조회합니다. 특정 작물의 일지만 조회할 수도 있습니다.',
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
    type: ScheduleListResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async findAll(
    @GetUser('id') userId: number,
    @Query('cropId') cropId?: string,
  ): Promise<ScheduleListResponseDto> {
    const parsedCropId = cropId ? parseInt(cropId, 10) : undefined;
    const schedules = await this.schedulesService.findAll(userId, parsedCropId);
    return {
      schedules,
      total: schedules.length,
    };
  }

  @Get('date-range')
  @ApiOperation({
    summary: '날짜 범위로 일정/작물일지 조회',
    description:
      '지정된 날짜 범위 내의 모든 일정과 작물일지를 조회합니다. React-calendar 월별 조회에 최적화되어 있습니다.',
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
    description: '날짜 범위 일정/작물일지 조회 성공',
    type: ScheduleListResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 날짜 형식' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @GetUser('id') userId: number,
    @Query('cropId') cropId?: string,
  ): Promise<ScheduleListResponseDto> {
    const parsedCropId = cropId ? parseInt(cropId, 10) : undefined;
    const schedules = await this.schedulesService.findByDateRange(
      userId,
      startDate,
      endDate,
      parsedCropId,
    );
    return {
      schedules,
      total: schedules.length,
    };
  }

  @Get('date/:date')
  @ApiOperation({
    summary: '특정 날짜 일정/작물일지 조회',
    description: '특정 날짜의 모든 일정과 작물일지를 조회합니다.',
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
    description: '특정 날짜 일정/작물일지 조회 성공',
    type: ScheduleListResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 날짜 형식' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async findByDate(
    @Param('date') date: string,
    @GetUser('id') userId: number,
    @Query('cropId') cropId?: string,
  ): Promise<ScheduleListResponseDto> {
    const parsedCropId = cropId ? parseInt(cropId, 10) : undefined;
    const schedules = await this.schedulesService.findByDate(
      userId,
      date,
      parsedCropId,
    );
    return {
      schedules,
      total: schedules.length,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: '특정 일정/작물일지 조회',
    description: 'ID로 특정 일정 또는 작물일지의 상세 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '조회할 일정/작물일지의 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '일정/작물일지 조회 성공',
    type: ScheduleResponseDto,
  })
  @ApiResponse({ status: 404, description: '작물일지를 찾을 수 없음' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ScheduleResponseDto> {
    return this.schedulesService.findOneById(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', logImageMulterConfig))
  @ApiOperation({
    summary: '작물일지 수정',
    description:
      '기존 작물일지의 정보를 수정합니다. 이미지를 새로 첨부할 수 있습니다.',
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
          description: '새 작물일지 이미지 파일 (JPEG, PNG, WebP, 최대 5MB)',
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
    type: ScheduleResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 404, description: '작물일지를 찾을 수 없음' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @GetUser('id') userId: number,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ScheduleResponseDto> {
    const imageUrl = file ? `/uploads/logs/${file.filename}` : undefined;
    return this.schedulesService.update(
      id,
      updateScheduleDto,
      userId,
      imageUrl,
    );
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
    type: Object,
  })
  @ApiResponse({ status: 404, description: '작물일지를 찾을 수 없음' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ): Promise<null> {
    await this.schedulesService.remove(id, userId);
    return null;
  }

  @Get('main')
  @ApiOperation({
    summary: '메인 캘린더 조회 (전체 작물일지)',
    description: '모든 작물일지를 캘린더 형태로 조회합니다.',
  })
  @ApiQuery({
    name: 'year',
    description: '조회할 년도',
    example: 2025,
    required: false,
  })
  @ApiQuery({
    name: 'month',
    description: '조회할 월 (1-12)',
    example: 8,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: '메인 캘린더 조회 성공',
    type: ScheduleListResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async findMainCalendar(
    @GetUser('id') userId: number,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ): Promise<ScheduleListResponseDto> {
    const currentDate = new Date();
    const targetYear = year ? parseInt(year, 10) : currentDate.getFullYear();
    const targetMonth = month
      ? parseInt(month, 10)
      : currentDate.getMonth() + 1;

    const startDate = `${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`;
    const endDate = new Date(targetYear, targetMonth, 0)
      .toISOString()
      .split('T')[0];

    const schedules = await this.schedulesService.findByDateRange(
      userId,
      startDate,
      endDate,
    );

    return {
      schedules,
      total: schedules.length,
    };
  }

  @Get('crop/:cropId')
  @ApiOperation({
    summary: '특정 작물의 캘린더 조회',
    description: '특정 작물의 일지만 캘린더 형태로 조회합니다.',
  })
  @ApiParam({
    name: 'cropId',
    description: '조회할 작물 ID',
    example: 1,
  })
  @ApiQuery({
    name: 'year',
    description: '조회할 년도',
    example: 2025,
    required: false,
  })
  @ApiQuery({
    name: 'month',
    description: '조회할 월 (1-12)',
    example: 8,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: '작물별 캘린더 조회 성공',
    type: ScheduleListResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 404, description: '작물을 찾을 수 없음' })
  async findCropCalendar(
    @Param('cropId', ParseIntPipe) cropId: number,
    @GetUser('id') userId: number,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ): Promise<ScheduleListResponseDto> {
    const currentDate = new Date();
    const targetYear = year ? parseInt(year, 10) : currentDate.getFullYear();
    const targetMonth = month
      ? parseInt(month, 10)
      : currentDate.getMonth() + 1;

    const startDate = `${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`;
    const endDate = new Date(targetYear, targetMonth, 0)
      .toISOString()
      .split('T')[0];

    const schedules = await this.schedulesService.findByDateRange(
      userId,
      startDate,
      endDate,
      cropId,
    );

    return {
      schedules,
      total: schedules.length,
    };
  }

  @Patch(':id/color')
  @ApiOperation({
    summary: '작물일지 색상 변경',
    description: '특정 작물일지의 캘린더 표시 색상을 변경합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '색상을 변경할 작물일지 ID',
    example: 1,
  })
  @ApiBody({
    type: UpdateColorDto,
    description: '색상 변경 데이터',
  })
  @ApiResponse({
    status: 200,
    description: '색상 변경 성공',
    type: ScheduleResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 색상 코드' })
  @ApiResponse({ status: 404, description: '작물일지를 찾을 수 없음' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async updateColor(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateColorDto: UpdateColorDto,
    @GetUser('id') userId: number,
  ): Promise<ScheduleResponseDto> {
    return this.schedulesService.updateColor(id, updateColorDto.color, userId);
  }
}
