import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { AiPostService } from './ai-post.service';
import { CreateAiPostDto } from './dto';

@UseGuards(JwtGuard)
@Controller('ai-posts')
export class AiPostController {
  constructor(private aiPostService: AiPostService) {}

  @Get()
  getManyAiPosts() {
    return this.aiPostService.getManyAiPosts();
  }

  @Get('related/:id')
  getRelatedAiPosts(@Param('id', ParseIntPipe) postId: number) {
    return this.aiPostService.getRelatedAiPosts(postId);
  }

  @Get('generate')
  generateRandomAiPost() {
    return this.aiPostService.generateAiPostRandom();
  }

  @Get('generate-with/:id')
  generateAiPostWith(@Param('id', ParseIntPipe) postId: number) {
    return this.aiPostService.generateAiPostWith(postId);
  }

  @Post('create')
  createAiPost(@Body() dto: CreateAiPostDto) {
    return this.aiPostService.createAiPost(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  deleteAiPost(@Param('id', ParseIntPipe) aiPostId: number) {
    return this.aiPostService.deleteAiPost(aiPostId);
  }
}
