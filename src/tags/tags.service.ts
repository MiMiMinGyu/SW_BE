import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}

  async findPopularTags(limit: number = 10): Promise<Tag[]> {
    return await this.tagsRepository
      .createQueryBuilder('tag')
      .orderBy('tag.usageCount', 'DESC')
      .limit(limit)
      .getMany();
  }

  async searchTags(query: string): Promise<Tag[]> {
    return await this.tagsRepository
      .createQueryBuilder('tag')
      .where('tag.name ILIKE :query', { query: `%${query}%` })
      .orderBy('tag.usageCount', 'DESC')
      .limit(20)
      .getMany();
  }
}