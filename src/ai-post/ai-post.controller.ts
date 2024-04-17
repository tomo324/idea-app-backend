import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
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

  @Get('generate')
  generateAiPost() {
    return this.aiPostService.generateAiPost();
  }

  @Post('create')
  createAiPost(@Body() dto: CreateAiPostDto) {
    return this.aiPostService.createAiPost(dto);
  }
}
