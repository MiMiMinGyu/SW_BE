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
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponseDto, PostListResponseDto } from './dto/post-response.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { PostCategory } from './enums/post-category.enum';

@ApiTags('게시판')
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
    type: ApiResponseDto<PostResponseDto>,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  async create(
    @Body() createPostDto: CreatePostDto,
    @GetUser('id') userId: number,
  ): Promise<ApiResponseDto<PostResponseDto>> {
    const data = await this.postsService.create(createPostDto, userId);
    return {
      success: true,
      message: '게시글이 성공적으로 작성되었습니다.',
      data,
    };
  }

  @Get()
  @ApiOperation({
    summary: '게시글 목록 조회',
    description:
      '게시글 목록을 조회합니다. 카테고리, 검색어, 정렬 등의 필터를 지원합니다.',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: PostCategory,
    description: '카테고리 필터 (전체/질문/일지/노하우)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: '검색어 (제목, 내용 검색)',
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
    type: ApiResponseDto<PostListResponseDto>,
  })
  async findAll(
    @Query('category') category?: PostCategory,
    @Query('search') search?: string,
    @Query('tags') tags?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: 'latest' | 'popular' | 'views',
    @GetUser('id') userId?: number,
  ): Promise<ApiResponseDto<PostListResponseDto>> {
    const options: PostQueryOptions = {
      category,
      search,
      tags: tags ? tags.split(',').map((tag) => tag.trim()) : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      sortBy: sortBy || 'latest',
      userId,
    };

    const data = await this.postsService.findAll(options);
    return {
      success: true,
      message: '게시글 목록을 성공적으로 조회했습니다.',
      data,
    };
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
    type: ApiResponseDto<PostResponseDto>,
  })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId?: number,
  ): Promise<ApiResponseDto<PostResponseDto>> {
    const data = await this.postsService.findOneById(id, userId);
    return {
      success: true,
      message: '게시글을 성공적으로 조회했습니다.',
      data,
    };
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
    type: ApiResponseDto<PostResponseDto>,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '수정 권한 없음' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @GetUser('id') userId: number,
  ): Promise<ApiResponseDto<PostResponseDto>> {
    const data = await this.postsService.update(id, updatePostDto, userId);
    return {
      success: true,
      message: '게시글이 성공적으로 수정되었습니다.',
      data,
    };
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
    type: ApiResponseDto<null>,
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '삭제 권한 없음' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ): Promise<ApiResponseDto<null>> {
    await this.postsService.remove(id, userId);
    return {
      success: true,
      message: '게시글이 성공적으로 삭제되었습니다.',
      data: null,
    };
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
    type: ApiResponseDto<PostResponseDto>,
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async toggleLike(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ): Promise<ApiResponseDto<PostResponseDto>> {
    const data = await this.postsService.toggleLike(id, userId);
    return {
      success: true,
      message: '좋아요 상태가 변경되었습니다.',
      data,
    };
  }
}
