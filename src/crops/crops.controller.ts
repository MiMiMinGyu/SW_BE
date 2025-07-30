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
} from '@nestjs/common';
import { CropsService } from './crops.service';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('crops')
@UseGuards(AuthGuard('jwt')) // 이 컨트롤러의 모든 API는 로그인이 필요합니다.
export class CropsController {
  constructor(private readonly cropsService: CropsService) {}

  @Post()
  create(@Body() createCropDto: CreateCropDto, @Req() req) {
    return this.cropsService.create(createCropDto, req.user);
  }

  @Get()
  findAll(@Req() req) {
    return this.cropsService.findAllByUser(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.cropsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCropDto: UpdateCropDto,
    @Req() req,
  ) {
    return this.cropsService.update(id, req.user.id, updateCropDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.cropsService.remove(id, req.user.id);
  }
}