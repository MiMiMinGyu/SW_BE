import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Post } from './entities/post.entity';
import { PostLike } from './entities/post-like.entity';
import { PostTag } from './entities/post-tag.entity';
import { Tag } from '../tags/entities/tag.entity';
import { User } from '../users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateReservationPostDto } from './dto/create-reservation-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponseDto, PostListResponseDto } from './dto/post-response.dto';
import { PostCategory } from './enums/post-category.enum';
import { UserType } from '../users/enums/user-type.enum';

export interface PostQueryOptions {
  category?: PostCategory;
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'latest' | 'popular' | 'views';
  userId?: number; // 좋아요 여부 확인용
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private postLikesRepository: Repository<PostLike>,
    @InjectRepository(PostTag)
    private postTagsRepository: Repository<PostTag>,
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    userId: number,
  ): Promise<PostResponseDto> {
    // 게시글 생성
    const post = this.postsRepository.create({
      ...createPostDto,
      images: createPostDto.images
        ? JSON.stringify(createPostDto.images)
        : null,
      user: { id: userId } as User,
    });

    const savedPost = await this.postsRepository.save(post);

    // 태그 처리
    if (createPostDto.tags && createPostDto.tags.length > 0) {
      await this.processTags(savedPost.id, createPostDto.tags);
    }

    return await this.findOneById(savedPost.id, userId);
  }

  async createReservationPost(
    createReservationPostDto: CreateReservationPostDto,
    userId: number,
  ): Promise<PostResponseDto> {
    const user = await this.getUserById(userId);

    if (user.userType !== UserType.EXPERT) {
      throw new ForbiddenException(
        '전문농업인만 예약 게시글을 작성할 수 있습니다.',
      );
    }

    const post = this.postsRepository.create({
      title: createReservationPostDto.title,
      content: createReservationPostDto.content,
      category: PostCategory.RESERVATION,
      price: createReservationPostDto.price,
      maxParticipants: createReservationPostDto.maxParticipants,
      scheduledDate: new Date(createReservationPostDto.scheduledDate),
      location: createReservationPostDto.location,
      images: createReservationPostDto.images
        ? JSON.stringify(createReservationPostDto.images)
        : null,
      user: { id: userId } as User,
    });

    const savedPost = await this.postsRepository.save(post);

    if (
      createReservationPostDto.tags &&
      createReservationPostDto.tags.length > 0
    ) {
      await this.processTags(savedPost.id, createReservationPostDto.tags);
    }

    return await this.findOneById(savedPost.id, userId);
  }

  private async getUserById(userId: number): Promise<User> {
    const user = await this.postsRepository.manager
      .getRepository(User)
      .findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  async findAll(options: PostQueryOptions = {}): Promise<PostListResponseDto> {
    const { page = 1, limit = 20, sortBy = 'latest', userId } = options;
    const skip = (page - 1) * limit;

    let query = this.buildBaseQuery();

    // 필터링 적용
    query = this.applyFilters(query, options);

    // 정렬 적용
    query = this.applySorting(query, sortBy);

    // 페이지네이션
    query = query.skip(skip).take(limit);

    const [posts, total] = await query.getManyAndCount();

    const postResponses = await Promise.all(
      posts.map((post) => this.transformToResponseDto(post, userId)),
    );

    return {
      posts: postResponses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneById(id: number, userId?: number): Promise<PostResponseDto> {
    const post = await this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.postTags', 'postTags')
      .leftJoinAndSelect('postTags.tag', 'tag')
      .where('post.id = :id', { id })
      .getOne();

    if (!post) {
      throw new NotFoundException(`ID ${id}번 게시글을 찾을 수 없습니다.`);
    }

    // 조회수 증가
    await this.postsRepository.increment({ id }, 'viewCount', 1);
    post.viewCount += 1;

    return await this.transformToResponseDto(post, userId);
  }

  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    userId: number,
  ): Promise<PostResponseDto> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException(`ID ${id}번 게시글을 찾을 수 없습니다.`);
    }

    if (post.user.id !== userId) {
      throw new ForbiddenException('게시글을 수정할 권한이 없습니다.');
    }

    // 기본 정보 업데이트
    Object.assign(post, {
      ...updatePostDto,
      images: updatePostDto.images
        ? JSON.stringify(updatePostDto.images)
        : post.images,
    });

    await this.postsRepository.save(post);

    // 태그 업데이트
    if (updatePostDto.tags !== undefined) {
      // 기존 태그 제거
      await this.postTagsRepository.delete({ post: { id } });

      // 새 태그 추가
      if (updatePostDto.tags.length > 0) {
        await this.processTags(id, updatePostDto.tags);
      }
    }

    return await this.findOneById(id, userId);
  }

  async remove(id: number, userId: number): Promise<void> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException(`ID ${id}번 게시글을 찾을 수 없습니다.`);
    }

    if (post.user.id !== userId) {
      throw new ForbiddenException('게시글을 삭제할 권한이 없습니다.');
    }

    await this.postsRepository.remove(post);
  }

  async toggleLike(postId: number, userId: number): Promise<PostResponseDto> {
    const post = await this.postsRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException(`ID ${postId}번 게시글을 찾을 수 없습니다.`);
    }

    const existingLike = await this.postLikesRepository.findOne({
      where: { post: { id: postId }, user: { id: userId } },
    });

    if (existingLike) {
      // 좋아요 제거
      await this.postLikesRepository.remove(existingLike);
      await this.postsRepository.decrement({ id: postId }, 'likeCount', 1);
    } else {
      // 좋아요 추가
      const postLike = this.postLikesRepository.create({
        post: { id: postId } as Post,
        user: { id: userId } as User,
      });
      await this.postLikesRepository.save(postLike);
      await this.postsRepository.increment({ id: postId }, 'likeCount', 1);
    }

    return await this.findOneById(postId, userId);
  }

  async getLikeStatus(
    postId: number,
    userId: number,
  ): Promise<{
    likeCount: number;
    isLiked: boolean;
  }> {
    const post = await this.postsRepository.findOne({
      where: { id: postId },
      select: ['id', 'likeCount'],
    });

    if (!post) {
      throw new NotFoundException(`ID ${postId}번 게시글을 찾을 수 없습니다.`);
    }

    const like = await this.postLikesRepository.findOne({
      where: { post: { id: postId }, user: { id: userId } },
    });
    const isLiked = !!like;

    return {
      likeCount: post.likeCount,
      isLiked,
    };
  }

  private buildBaseQuery(): SelectQueryBuilder<Post> {
    return this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.postTags', 'postTags')
      .leftJoinAndSelect('postTags.tag', 'tag');
  }

  private applyFilters(
    query: SelectQueryBuilder<Post>,
    options: PostQueryOptions,
  ): SelectQueryBuilder<Post> {
    const { category, search, tags } = options;

    if (category) {
      query = query.andWhere('post.category = :category', { category });
    }

    if (search) {
      query = query.andWhere(
        '(post.title ILIKE :search OR post.content ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (tags && tags.length > 0) {
      query = query.andWhere('tag.name IN (:...tags)', { tags });
    }

    return query;
  }

  private applySorting(
    query: SelectQueryBuilder<Post>,
    sortBy: string,
  ): SelectQueryBuilder<Post> {
    switch (sortBy) {
      case 'popular':
        return query
          .addOrderBy('post.likeCount', 'DESC')
          .addOrderBy('post.createdAt', 'DESC');
      case 'views':
        return query
          .addOrderBy('post.viewCount', 'DESC')
          .addOrderBy('post.createdAt', 'DESC');
      default:
        return query.addOrderBy('post.createdAt', 'DESC');
    }
  }

  private async processTags(postId: number, tagNames: string[]): Promise<void> {
    for (const tagName of tagNames) {
      // 태그 생성 또는 찾기
      let tag = await this.tagsRepository.findOne({ where: { name: tagName } });

      if (!tag) {
        tag = this.tagsRepository.create({ name: tagName });
        tag = await this.tagsRepository.save(tag);
      }

      // 사용 횟수 증가
      await this.tagsRepository.increment({ id: tag.id }, 'usageCount', 1);

      // PostTag 관계 생성
      const postTag = this.postTagsRepository.create({
        post: { id: postId } as Post,
        tag: { id: tag.id } as Tag,
      });
      await this.postTagsRepository.save(postTag);
    }
  }

  private async transformToResponseDto(
    post: Post,
    userId?: number,
  ): Promise<PostResponseDto> {
    // 사용자의 좋아요 여부 확인
    let isLiked = false;
    if (userId) {
      const like = await this.postLikesRepository.findOne({
        where: { post: { id: post.id }, user: { id: userId } },
      });
      isLiked = !!like;
    }

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      category: post.category,
      images: post.images ? (JSON.parse(post.images) as string[]) : [],
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      user: {
        id: post.user.id,
        email: post.user.email,
        nickname: post.user.nickname,
        name: post.user.name,
        interestCrops: post.user.interestCrops,
        profileImage: post.user.profileImage,
        userType: post.user.userType,
        createdAt: post.user.createdAt,
        updatedAt: post.user.updatedAt,
      },
      tags:
        post.postTags?.map((postTag) => ({
          id: postTag.tag.id,
          name: postTag.tag.name,
          color: postTag.tag.color,
        })) || [],
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      isLiked,
    };
  }
}
