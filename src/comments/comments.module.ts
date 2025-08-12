import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController, CommentManagementController } from './comments.controller';
import { Comment } from './entities/comment.entity';
import { Post } from '../posts/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Post])],
  controllers: [CommentsController, CommentManagementController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}