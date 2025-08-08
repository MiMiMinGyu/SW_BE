import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { LogsService } from './logs.service';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('logs')
@UseGuards(AuthGuard('jwt'))
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createLogDto: CreateLogDto,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.logsService.create(createLogDto, req.user, file);
  }

  @Get()
  findAll(@Req() req) {
    return this.logsService.findAllByUser(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.logsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLogDto: UpdateLogDto,
    @Req() req,
  ) {
    return this.logsService.update(id, req.user.id, updateLogDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.logsService.remove(id, req.user.id);
  }
}