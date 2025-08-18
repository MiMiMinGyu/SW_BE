import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { ReservationResponseDto } from './dto/reservation-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('4. Reservation - 예약 관리')
@ApiBearerAuth()
@Controller('reservations')
@UseGuards(AuthGuard('jwt'))
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post('posts/:postId')
  @ApiOperation({
    summary: '예약 신청',
    description:
      '전문농업인의 예약 게시글에 예약을 신청합니다. 필수값: participantCount (참가 인원)',
  })
  @ApiParam({
    name: 'postId',
    description: '예약할 게시글 ID',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 201,
    description: '예약 신청이 성공적으로 완료되었습니다.',
    type: ReservationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      '잘못된 요청 데이터 또는 예약 불가 (본인 게시글, 정원 초과, 중복 예약 등)',
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async create(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() createReservationDto: CreateReservationDto,
    @GetUser('id') userId: number,
  ): Promise<ReservationResponseDto> {
    return this.reservationsService.create(
      postId,
      userId,
      createReservationDto,
    );
  }

  @Get('my')
  @ApiOperation({
    summary: '내 예약 목록 조회',
    description: '내가 신청한 예약 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '예약 목록 조회 성공',
    type: [ReservationResponseDto],
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async findMyReservations(
    @GetUser('id') userId: number,
  ): Promise<ReservationResponseDto[]> {
    return this.reservationsService.findMyReservations(userId);
  }

  @Get('received')
  @ApiOperation({
    summary: '받은 예약 목록 조회',
    description: '내 게시글에 신청된 예약 목록을 조회합니다. (전문농업인)',
  })
  @ApiResponse({
    status: 200,
    description: '받은 예약 목록 조회 성공',
    type: [ReservationResponseDto],
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async findReceivedReservations(
    @GetUser('id') userId: number,
  ): Promise<ReservationResponseDto[]> {
    return this.reservationsService.findReceivedReservations(userId);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: '예약 상태 변경',
    description:
      '예약을 승인하거나 거절합니다. 게시글 작성자 또는 예약자만 가능합니다. 필수값: status (CONFIRMED, CANCELLED 등)',
  })
  @ApiParam({
    name: 'id',
    description: '변경할 예약 ID',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '예약 상태 변경 성공',
    type: ReservationResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터 또는 상태값' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({
    status: 403,
    description: '권한 없음 (게시글 작성자 또는 예약자만 가능)',
  })
  @ApiResponse({ status: 404, description: '예약을 찾을 수 없음' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservationStatusDto: UpdateReservationStatusDto,
    @GetUser('id') userId: number,
  ): Promise<ReservationResponseDto> {
    return this.reservationsService.updateStatus(
      id,
      userId,
      updateReservationStatusDto,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: '예약 상세 조회',
    description: '특정 예약의 상세 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '조회할 예약 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '예약 조회 성공',
    type: ReservationResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '예약을 찾을 수 없음' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ): Promise<ReservationResponseDto> {
    return this.reservationsService.findOne(id, userId);
  }

  @Get()
  @ApiOperation({
    summary: '모든 예약 목록 조회 (관리자용)',
    description: '관리자만 접근 가능한 모든 예약 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '예약 목록 조회 성공',
    type: [ReservationResponseDto],
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '관리자 권한 필요' })
  async findAll(
    @GetUser() user: { userType: string },
  ): Promise<ReservationResponseDto[]> {
    return this.reservationsService.findAll(user.userType);
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: '예약 취소',
    description:
      '예약을 취소합니다. 예약자 또는 게시글 작성자가 취소할 수 있습니다. 선택값: cancelReason (취소 사유)',
  })
  @ApiParam({
    name: 'id',
    description: '취소할 예약 ID',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '예약 취소 성공',
    type: ReservationResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({
    status: 403,
    description: '권한 없음 (예약자 또는 게시글 작성자만 가능)',
  })
  @ApiResponse({ status: 404, description: '예약을 찾을 수 없음' })
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body('cancelReason') cancelReason: string,
    @GetUser('id') userId: number,
  ): Promise<ReservationResponseDto> {
    return this.reservationsService.cancel(id, userId, cancelReason);
  }
}
