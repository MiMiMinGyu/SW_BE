import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { Tag } from './entities/tag.entity';

@ApiTags('9. Tag - 태그 관리')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get('popular')
  @ApiOperation({
    summary: '인기 태그 조회',
    description: '사용 빈도가 높은 인기 태그들을 조회합니다.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '조회할 태그 개수 (기본값: 10)',
  })
  @ApiResponse({
    status: 200,
    description: '인기 태그 조회 성공',
    type: [Tag],
  })
  async findPopular(@Query('limit') limit?: string): Promise<Tag[]> {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.tagsService.findPopularTags(limitNumber);
  }

  @Get('search')
  @ApiOperation({
    summary: '태그 검색',
    description: '태그명으로 태그를 검색합니다.',
  })
  @ApiQuery({
    name: 'q',
    description: '검색할 태그명',
    example: '배추',
  })
  @ApiResponse({
    status: 200,
    description: '태그 검색 성공',
    type: [Tag],
  })
  async search(@Query('q') query: string): Promise<Tag[]> {
    return this.tagsService.searchTags(query);
  }
}
