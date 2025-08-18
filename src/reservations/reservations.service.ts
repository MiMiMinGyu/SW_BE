import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { ReservationResponseDto } from './dto/reservation-response.dto';
import { ReservationStatus } from './enums/reservation-status.enum';
import { PostCategory } from '../posts/enums/post-category.enum';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async create(
    postId: number,
    userId: number,
    createReservationDto: CreateReservationDto,
  ): Promise<ReservationResponseDto> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    if (post.category !== PostCategory.RESERVATION) {
      throw new BadRequestException('예약 가능한 게시글이 아닙니다.');
    }

    if (!post.isActive) {
      throw new BadRequestException('비활성화된 게시글입니다.');
    }

    if (post.user.id === userId) {
      throw new BadRequestException('본인의 게시글에는 예약할 수 없습니다.');
    }

    if (post.scheduledDate && new Date(post.scheduledDate) < new Date()) {
      throw new BadRequestException('이미 지난 일정입니다.');
    }

    const totalAfterReservation =
      post.currentParticipants + createReservationDto.participantCount;
    if (post.maxParticipants && totalAfterReservation > post.maxParticipants) {
      throw new BadRequestException('참가 가능 인원을 초과했습니다.');
    }

    const existingReservation = await this.reservationRepository.findOne({
      where: {
        post: { id: postId },
        user: { id: userId },
        status: ReservationStatus.PENDING,
      },
    });

    if (existingReservation) {
      throw new BadRequestException('이미 예약 신청한 게시글입니다.');
    }

    const reservation = this.reservationRepository.create({
      ...createReservationDto,
      user: { id: userId } as User,
      post: { id: postId } as Post,
      status: ReservationStatus.PENDING,
    });

    const savedReservation = await this.reservationRepository.save(reservation);

    // 관계 데이터를 포함하여 다시 조회
    const reservationWithRelations = await this.reservationRepository.findOne({
      where: { id: savedReservation.id },
      relations: ['user', 'post', 'post.user'],
    });

    if (!reservationWithRelations) {
      throw new NotFoundException('예약 정보를 찾을 수 없습니다.');
    }

    return this.transformToResponseDto(reservationWithRelations);
  }

  async findMyReservations(userId: number): Promise<ReservationResponseDto[]> {
    const reservations = await this.reservationRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'post', 'post.user'],
      order: { createdAt: 'DESC' },
    });
    return reservations.map((reservation) =>
      this.transformToResponseDto(reservation),
    );
  }

  async findReceivedReservations(
    userId: number,
  ): Promise<ReservationResponseDto[]> {
    const reservations = await this.reservationRepository.find({
      where: { post: { user: { id: userId } } },
      relations: ['user', 'post'],
      order: { createdAt: 'DESC' },
    });
    return reservations.map((reservation) =>
      this.transformToResponseDto(reservation),
    );
  }

  async updateStatus(
    reservationId: number,
    userId: number,
    updateReservationStatusDto: UpdateReservationStatusDto,
  ): Promise<ReservationResponseDto> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['post', 'post.user', 'user'],
    });

    if (!reservation) {
      throw new NotFoundException('예약을 찾을 수 없습니다.');
    }

    if (reservation.post.user.id !== userId && reservation.user.id !== userId) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    if (updateReservationStatusDto.status === ReservationStatus.CONFIRMED) {
      if (reservation.post.user.id !== userId) {
        throw new ForbiddenException(
          '예약 승인은 게시글 작성자만 할 수 있습니다.',
        );
      }

      await this.postRepository.increment(
        { id: reservation.post.id },
        'currentParticipants',
        reservation.participantCount,
      );
    }

    if (updateReservationStatusDto.status === ReservationStatus.CANCELLED) {
      if (reservation.status === ReservationStatus.CONFIRMED) {
        await this.postRepository.decrement(
          { id: reservation.post.id },
          'currentParticipants',
          reservation.participantCount,
        );
      }
    }

    reservation.status = updateReservationStatusDto.status;
    if (updateReservationStatusDto.cancelReason) {
      reservation.cancelReason = updateReservationStatusDto.cancelReason;
    }

    const savedReservation = await this.reservationRepository.save(reservation);
    return this.transformToResponseDto(savedReservation);
  }

  async findOne(
    reservationId: number,
    userId: number,
  ): Promise<ReservationResponseDto> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['user', 'post', 'post.user'],
    });

    if (!reservation) {
      throw new NotFoundException('예약을 찾을 수 없습니다.');
    }

    if (reservation.user.id !== userId && reservation.post.user.id !== userId) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    return this.transformToResponseDto(reservation);
  }

  async findAll(userType?: string): Promise<ReservationResponseDto[]> {
    // 관리자 권한 확인 (향후 ADMIN enum 추가 시 수정 필요)
    if (userType !== 'ADMIN') {
      throw new ForbiddenException('관리자 권한이 필요합니다.');
    }

    const reservations = await this.reservationRepository.find({
      relations: ['user', 'post', 'post.user'],
      order: { createdAt: 'DESC' },
    });
    return reservations.map((reservation) =>
      this.transformToResponseDto(reservation),
    );
  }

  async cancel(
    reservationId: number,
    userId: number,
    cancelReason?: string,
  ): Promise<ReservationResponseDto> {
    return await this.updateStatus(reservationId, userId, {
      status: ReservationStatus.CANCELLED,
      cancelReason,
    });
  }

  private transformToResponseDto(
    reservation: Reservation,
  ): ReservationResponseDto {
    return {
      id: reservation.id,
      participantCount: reservation.participantCount,
      status: reservation.status,
      message: reservation.message,
      cancelReason: reservation.cancelReason,
      user: {
        id: reservation.user.id,
        email: reservation.user.email,
        nickname: reservation.user.nickname,
        name: reservation.user.name,
        interestCrops: reservation.user.interestCrops,
        profileImage: reservation.user.profileImage,
        userType: reservation.user.userType,
        createdAt: reservation.user.createdAt,
        updatedAt: reservation.user.updatedAt,
      },
      post: {
        id: reservation.post.id,
        title: reservation.post.title,
        content: reservation.post.content,
        category: reservation.post.category,
        images: reservation.post.images
          ? (JSON.parse(reservation.post.images) as string[])
          : [],
        viewCount: reservation.post.viewCount,
        likeCount: reservation.post.likeCount,
        commentCount: reservation.post.commentCount,
        price: reservation.post.price ?? undefined,
        maxParticipants: reservation.post.maxParticipants ?? undefined,
        currentParticipants: reservation.post.currentParticipants,
        scheduledDate: reservation.post.scheduledDate ?? undefined,
        location: reservation.post.location ?? undefined,
        isActive: reservation.post.isActive,
        user: reservation.post.user
          ? {
              id: reservation.post.user.id,
              email: reservation.post.user.email,
              nickname: reservation.post.user.nickname,
              name: reservation.post.user.name,
              interestCrops: reservation.post.user.interestCrops,
              profileImage: reservation.post.user.profileImage,
              userType: reservation.post.user.userType,
              createdAt: reservation.post.user.createdAt,
              updatedAt: reservation.post.user.updatedAt,
            }
          : null,
        tags: [], // 태그 정보가 필요하다면 relations에 추가 필요
        createdAt: reservation.post.createdAt,
        updatedAt: reservation.post.updatedAt,
      },
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
    };
  }
}
