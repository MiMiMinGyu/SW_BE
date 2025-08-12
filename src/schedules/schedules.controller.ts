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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
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

@ApiTags('일정 관리')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @ApiOperation({
    summary: '새 일정 생성',
    description: '사용자의 새로운 일정을 생성합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '일정이 성공적으로 생성되었습니다.',
    type: ApiResponseDto<ScheduleResponseDto>,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async create(
    @Body() createScheduleDto: CreateScheduleDto,
    @GetUser('id') userId: number,
  ): Promise<ApiResponseDto<ScheduleResponseDto>> {
    const data = await this.schedulesService.create(createScheduleDto, userId);
    return {
      success: true,
      message: '일정이 성공적으로 생성되었습니다.',
      data,
    };
  }

  @Get()
  @ApiOperation({
    summary: '일정 목록 조회',
    description: '사용자의 모든 일정을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '일정 목록 조회 성공',
    type: ApiResponseDto<ScheduleListResponseDto>,
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async findAll(
    @GetUser('id') userId: number,
  ): Promise<ApiResponseDto<ScheduleListResponseDto>> {
    const schedules = await this.schedulesService.findAll(userId);
    return {
      success: true,
      message: '일정 목록을 성공적으로 조회했습니다.',
      data: {
        schedules,
        total: schedules.length,
      },
    };
  }

  @Get('date-range')
  @ApiOperation({
    summary: '날짜 범위로 일정 조회',
    description:
      '지정된 날짜 범위 내의 일정들을 조회합니다. React-calendar 월별 조회에 최적화되어 있습니다.',
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
  @ApiResponse({
    status: 200,
    description: '날짜 범위 일정 조회 성공',
    type: ApiResponseDto<ScheduleListResponseDto>,
  })
  @ApiResponse({ status: 400, description: '잘못된 날짜 형식' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @GetUser('id') userId: number,
  ): Promise<ApiResponseDto<ScheduleListResponseDto>> {
    const schedules = await this.schedulesService.findByDateRange(
      userId,
      startDate,
      endDate,
    );
    return {
      success: true,
      message: '날짜 범위 일정을 성공적으로 조회했습니다.',
      data: {
        schedules,
        total: schedules.length,
      },
    };
  }

  @Get('date/:date')
  @ApiOperation({
    summary: '특정 날짜 일정 조회',
    description: '특정 날짜의 모든 일정을 조회합니다.',
  })
  @ApiParam({
    name: 'date',
    description: '조회할 날짜 (YYYY-MM-DD)',
    example: '2025-08-15',
  })
  @ApiResponse({
    status: 200,
    description: '특정 날짜 일정 조회 성공',
    type: ApiResponseDto<ScheduleListResponseDto>,
  })
  @ApiResponse({ status: 400, description: '잘못된 날짜 형식' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async findByDate(
    @Param('date') date: string,
    @GetUser('id') userId: number,
  ): Promise<ApiResponseDto<ScheduleListResponseDto>> {
    const schedules = await this.schedulesService.findByDate(userId, date);
    return {
      success: true,
      message: '특정 날짜 일정을 성공적으로 조회했습니다.',
      data: {
        schedules,
        total: schedules.length,
      },
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: '특정 일정 조회',
    description: 'ID로 특정 일정의 상세 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '조회할 일정의 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '일정 조회 성공',
    type: ApiResponseDto<ScheduleResponseDto>,
  })
  @ApiResponse({ status: 404, description: '일정을 찾을 수 없음' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponseDto<ScheduleResponseDto>> {
    const data = await this.schedulesService.findOneById(id);
    return {
      success: true,
      message: '일정을 성공적으로 조회했습니다.',
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: '일정 수정',
    description: '기존 일정의 정보를 수정합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '수정할 일정의 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '일정 수정 성공',
    type: ApiResponseDto<ScheduleResponseDto>,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 404, description: '일정을 찾을 수 없음' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @GetUser('id') userId: number,
  ): Promise<ApiResponseDto<ScheduleResponseDto>> {
    const data = await this.schedulesService.update(
      id,
      updateScheduleDto,
      userId,
    );
    return {
      success: true,
      message: '일정이 성공적으로 수정되었습니다.',
      data,
    };
  }

  @Patch(':id/toggle-complete')
  @ApiOperation({
    summary: '일정 완료 상태 토글',
    description: '일정의 완료 상태를 토글합니다 (완료 ↔ 미완료).',
  })
  @ApiParam({
    name: 'id',
    description: '완료 상태를 변경할 일정의 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '일정 완료 상태 변경 성공',
    type: ApiResponseDto<ScheduleResponseDto>,
  })
  @ApiResponse({ status: 404, description: '일정을 찾을 수 없음' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async toggleComplete(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ): Promise<ApiResponseDto<ScheduleResponseDto>> {
    const data = await this.schedulesService.toggleComplete(id, userId);
    return {
      success: true,
      message: '일정 완료 상태가 변경되었습니다.',
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: '일정 삭제',
    description: '특정 일정을 삭제합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '삭제할 일정의 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '일정 삭제 성공',
    type: ApiResponseDto<null>,
  })
  @ApiResponse({ status: 404, description: '일정을 찾을 수 없음' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ): Promise<ApiResponseDto<null>> {
    await this.schedulesService.remove(id, userId);
    return {
      success: true,
      message: '일정이 성공적으로 삭제되었습니다.',
      data: null,
    };
  }
}
