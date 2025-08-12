import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto, CommentListResponseDto } from './dto/comment-response.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@ApiTags('댓글')
@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '댓글 작성',
    description: '게시글에 새로운 댓글을 작성합니다.',
  })
  @ApiParam({
    name: 'postId',
    description: '게시글 ID',
    example: 1,
  })
  @ApiResponse({
    status: 201,
    description: '댓글이 성공적으로 작성되었습니다.',
    type: ApiResponseDto<CommentResponseDto>,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async create(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() createCommentDto: CreateCommentDto,
    @GetUser('id') userId: number,
  ): Promise<ApiResponseDto<CommentResponseDto>> {
    const data = await this.commentsService.create(postId, createCommentDto, userId);
    return {
      success: true,
      message: '댓글이 성공적으로 작성되었습니다.',
      data,
    };
  }

  @Get()
  @ApiOperation({
    summary: '게시글의 댓글 목록 조회',
    description: '특정 게시글의 모든 댓글을 조회합니다.',
  })
  @ApiParam({
    name: 'postId',
    description: '게시글 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '댓글 목록 조회 성공',
    type: ApiResponseDto<CommentListResponseDto>,
  })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async findByPostId(
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<ApiResponseDto<CommentListResponseDto>> {
    const data = await this.commentsService.findByPostId(postId);
    return {
      success: true,
      message: '댓글 목록을 성공적으로 조회했습니다.',
      data,
    };
  }
}

@ApiTags('댓글')
@Controller('comments')
export class CommentManagementController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':id')
  @ApiOperation({
    summary: '특정 댓글 조회',
    description: '댓글 ID로 특정 댓글을 조회합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '댓글 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '댓글 조회 성공',
    type: ApiResponseDto<CommentResponseDto>,
  })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponseDto<CommentResponseDto>> {
    const data = await this.commentsService.findOneById(id);
    return {
      success: true,
      message: '댓글을 성공적으로 조회했습니다.',
      data,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '댓글 수정',
    description: '기존 댓글을 수정합니다. 작성자만 수정할 수 있습니다.',
  })
  @ApiParam({
    name: 'id',
    description: '수정할 댓글 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '댓글 수정 성공',
    type: ApiResponseDto<CommentResponseDto>,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '수정 권한 없음' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser('id') userId: number,
  ): Promise<ApiResponseDto<CommentResponseDto>> {
    const data = await this.commentsService.update(id, updateCommentDto, userId);
    return {
      success: true,
      message: '댓글이 성공적으로 수정되었습니다.',
      data,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '댓글 삭제',
    description: '댓글을 삭제합니다. 작성자만 삭제할 수 있습니다.',
  })
  @ApiParam({
    name: 'id',
    description: '삭제할 댓글 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '댓글 삭제 성공',
    type: ApiResponseDto<null>,
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 403, description: '삭제 권한 없음' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: number,
  ): Promise<ApiResponseDto<null>> {
    await this.commentsService.remove(id, userId);
    return {
      success: true,
      message: '댓글이 성공적으로 삭제되었습니다.',
      data: null,
    };
  }
}