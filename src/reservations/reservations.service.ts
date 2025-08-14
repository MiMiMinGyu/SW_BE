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
  ): Promise<Reservation> {
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

    return await this.reservationRepository.save(reservation);
  }

  async findMyReservations(userId: number): Promise<Reservation[]> {
    return await this.reservationRepository.find({
      where: { user: { id: userId } },
      relations: ['post', 'post.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findReceivedReservations(userId: number): Promise<Reservation[]> {
    return await this.reservationRepository.find({
      where: { post: { user: { id: userId } } },
      relations: ['user', 'post'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(
    reservationId: number,
    userId: number,
    updateReservationStatusDto: UpdateReservationStatusDto,
  ): Promise<Reservation> {
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

    return await this.reservationRepository.save(reservation);
  }

  async cancel(
    reservationId: number,
    userId: number,
    cancelReason?: string,
  ): Promise<Reservation> {
    return await this.updateStatus(reservationId, userId, {
      status: ReservationStatus.CANCELLED,
      cancelReason,
    });
  }
}
