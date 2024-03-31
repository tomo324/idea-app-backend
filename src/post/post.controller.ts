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
import { CreatePostDto } from './dto';
import { PostService } from './post.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';

@UseGuards(JwtGuard)
@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  @Post('create')
  createPost(@GetUser('id') userId: number, @Body() dto: CreatePostDto) {
    return this.postService.createPost(userId, dto);
  }

  @Get()
  getManyPosts() {
    return this.postService.getManyPosts();
  }

  @Get(':id')
  getOnePost(@Param('id', ParseIntPipe) postId: number) {
    return this.postService.getOnePost(postId);
  }

  @Get('my-posts')
  getMyPosts(@GetUser('id') userId: number) {
    return this.postService.getMyPosts(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  deletePost(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) postId: number,
  ) {
    return this.postService.deletePost(userId, postId);
  }
}
