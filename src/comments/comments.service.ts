import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import {
  CommentResponseDto,
  CommentListResponseDto,
} from './dto/comment-response.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async create(
    postId: number,
    createCommentDto: CreateCommentDto,
    userId: number,
  ): Promise<CommentResponseDto> {
    // 게시글 존재 확인
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`ID ${postId}번 게시글을 찾을 수 없습니다.`);
    }

    // 댓글 생성
    const comment = this.commentsRepository.create({
      content: createCommentDto.content,
      isAnonymous: createCommentDto.isAnonymous ?? false,
      post: { id: postId } as Post,
      user: { id: userId } as User,
    });

    const savedComment = await this.commentsRepository.save(comment);

    // 게시글의 댓글 수 증가
    await this.postsRepository.increment({ id: postId }, 'commentCount', 1);

    return await this.findOneById(savedComment.id);
  }

  async findByPostId(postId: number): Promise<CommentListResponseDto> {
    // 게시글 존재 확인
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`ID ${postId}번 게시글을 찾을 수 없습니다.`);
    }

    const [comments, total] = await this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.post.id = :postId', { postId })
      .orderBy('comment.createdAt', 'DESC')
      .getManyAndCount();

    const commentResponses = comments.map((comment) =>
      this.transformToResponseDto(comment),
    );

    return {
      comments: commentResponses,
      total,
    };
  }

  async findOneById(id: number): Promise<CommentResponseDto> {
    const comment = await this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.id = :id', { id })
      .getOne();

    if (!comment) {
      throw new NotFoundException(`ID ${id}번 댓글을 찾을 수 없습니다.`);
    }

    return this.transformToResponseDto(comment);
  }

  async update(
    id: number,
    updateCommentDto: UpdateCommentDto,
    userId: number,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException(`ID ${id}번 댓글을 찾을 수 없습니다.`);
    }

    if (comment.user.id !== userId) {
      throw new ForbiddenException('댓글을 수정할 권한이 없습니다.');
    }

    Object.assign(comment, updateCommentDto);
    await this.commentsRepository.save(comment);

    return await this.findOneById(id);
  }

  async remove(id: number, userId: number): Promise<void> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['user', 'post'],
    });

    if (!comment) {
      throw new NotFoundException(`ID ${id}번 댓글을 찾을 수 없습니다.`);
    }

    if (comment.user.id !== userId) {
      throw new ForbiddenException('댓글을 삭제할 권한이 없습니다.');
    }

    // 게시글의 댓글 수 감소
    await this.postsRepository.decrement(
      { id: comment.post.id },
      'commentCount',
      1,
    );

    await this.commentsRepository.remove(comment);
  }

  private transformToResponseDto(comment: Comment): CommentResponseDto {
    return {
      id: comment.id,
      content: comment.content,
      likeCount: comment.likeCount,
      isAnonymous: comment.isAnonymous,
      user: comment.isAnonymous
        ? {
            id: comment.user.id,
            email: comment.user.email,
            nickname: '익명',
            name: null,
            interestCrops: null,
            profileImage: '/uploads/farmer_icon.png', // 기본 프로필 이미지
            userType: comment.user.userType,
            createdAt: comment.user.createdAt,
            updatedAt: comment.user.updatedAt,
          }
        : {
            id: comment.user.id,
            email: comment.user.email,
            nickname: comment.user.nickname,
            name: comment.user.name,
            interestCrops: comment.user.interestCrops,
            profileImage: comment.user.profileImage,
            userType: comment.user.userType,
            createdAt: comment.user.createdAt,
            updatedAt: comment.user.updatedAt,
          },
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}
