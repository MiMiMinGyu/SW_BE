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
import { AuthGuard } from '@nestjs/passport';
import { PostsService, PostQueryOptions } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateReservationPostDto } from './dto/create-reservation-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponseDto, PostListResponseDto } from './dto/post-response.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { PostCategory } from './enums/post-category.enum';

@ApiTags('3. Post - 게시글 관리')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '게시글 작성',
    description: '새로운 게시글을 작성합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '게시글이 성공적으로 작성되었습니다.',
    type: PostResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async create(
    @Body() createPostDto: CreatePostDto,
    @GetUser('id') userId: number,
  ): Promise<PostResponseDto> {
    return this.postsService.create(createPostDto, userId);
  }

  @Post('reservation')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '예약 게시글 작성',
    description: '전문농업인만 작성 가능한 예약 게시글을 작성합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '예약 게시글이 성공적으로 작성되었습니다.',
    type: PostResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '전문농업인만 작성 가능' })
  async createReservationPost(
    @Body() createReservationPostDto: CreateReservationPostDto,
    @GetUser('id') userId: number,
  ): Promise<PostResponseDto> {
    return this.postsService.createReservationPost(
      createReservationPostDto,
      userId,
    );
  }

  @Get()
  @ApiOperation({
    summary: '게시글 목록 조회',
    description: `게시글 목록을 조회합니다. 다양한 필터와 검색 옵션을 제공합니다.

📋 주요 기능:
• 텍스트 검색: 제목/내용에서 키워드 검색
• 카테고리 필터: 일반글/질문/일지/노하우/예약글/자유게시판/건의게시판 분류
• 태그 검색: 관련 태그로 필터링
• 정렬: 최신순/인기순/조회순
• 권한 제어: 건의게시판은 관리자만 접근 가능

🔍 검색 예시:
• ?search=토마토 (제목/내용에 "토마토" 포함)
• ?category=reservation&search=체험 (예약글 중 "체험" 검색)
• ?tags=배추,병해충 (배추, 병해충 태그)
• ?category=suggestion (건의게시판 - 관리자 전용)`,
  })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: PostCategory,
    description: '카테고리 필터 (전체/질문/일지/노하우/예약/자유게시판/건의게시판)',
    example: 'free',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: '검색어 - 게시글 제목이나 내용에서 키워드를 검색합니다',
    example: '토마토',
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    description: '태그 필터 (쉼표로 구분)',
    example: '배추,병해충',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '페이지 번호 (기본값: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '페이지당 게시글 수 (기본값: 20)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['latest', 'popular', 'views'],
    description: '정렬 방식 (최신순/인기순/조회순)',
  })
  @ApiResponse({
    status: 200,
    description: '게시글 목록 조회 성공',
    type: PostListResponseDto,
  })
  async findAll(
    @Query('category') category?: PostCategory,
    @Query('search') search?: string,
    @Query('tags') tags?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: 'latest' | 'popular' | 'views',
    @GetUser() user?: any,
  ): Promise<PostListResponseDto> {
    const options: PostQueryOptions = {
      category,
      search,
      tags: tags ? tags.split(',').map((tag) => tag.trim()) : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      sortBy: sortBy || 'latest',
      userId: user?.id,
      userType: user?.userType,
    };

    return this.postsService.findAll(options);
  }

  @Get(':id')
  @ApiOperation({
    summary: '게시글 상세 조회',
    description: '특정 게시글의 상세 정보를 조회합니다. 조회수가 증가됩니다.',
  })
  @ApiParam({
    name: 'id',
    description: '게시글 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '게시글 조회 성공',
    type: PostResponseDto,
  })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user?: any,
  ): Promise<PostResponseDto> {
    return this.postsService.findOneById(id, user?.id, user?.userType);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '게시글 수정',
    description: '기존 게시글을 수정합니다. 작성자만 수정할 수 있습니다.',
  })
  @ApiParam({
    name: 'id',
    description: '수정할 게시글 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '게시글 수정 성공',
    type: PostResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '수정 권한 없음' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @GetUser('id') userId: number,
  ): Promise<PostResponseDto> {
    return this.postsService.update(id, updatePostDto, userId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '게시글 삭제',
    description: '게시글을 삭제합니다. 작성자만 삭제할 수 있습니다.',
  })
  @ApiParam({
    name: 'id',
    description: '삭제할 게시글 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '게시글 삭제 성공',
    type: Object,
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '삭제 권한 없음' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ): Promise<null> {
    await this.postsService.remove(id, userId);
    return null;
  }

  @Get(':id/like')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '게시글 좋아요 상태 조회',
    description: `게시글의 좋아요 수와 현재 사용자의 좋아요 여부를 조회합니다.

📊 반환 정보:
• likeCount: 총 좋아요 수
• isLiked: 현재 사용자의 좋아요 여부 (로그인 필수)

💡 활용 예시:
• 게시글 목록에서 좋아요 수 표시
• 좋아요 버튼 상태 (빨간색/회색) 결정
• 실시간 좋아요 카운트 업데이트`,
  })
  @ApiParam({
    name: 'id',
    description: '조회할 게시글 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '좋아요 상태 조회 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: '좋아요 상태를 조회했습니다.',
        },
        data: {
          type: 'object',
          properties: {
            likeCount: {
              type: 'number',
              example: 15,
              description: '총 좋아요 수',
            },
            isLiked: {
              type: 'boolean',
              example: true,
              description:
                '현재 사용자의 좋아요 여부 (로그인 시에만 true/false, 비로그인 시 false)',
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async getLikeStatus(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ): Promise<{ likeCount: number; isLiked: boolean }> {
    return await this.postsService.getLikeStatus(id, userId);
  }

  @Post(':id/like')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '게시글 좋아요 토글',
    description: '게시글의 좋아요를 추가하거나 제거합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '좋아요할 게시글 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '좋아요 상태 변경 성공',
    type: PostResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async toggleLike(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ): Promise<PostResponseDto> {
    return this.postsService.toggleLike(id, userId);
  }
}
