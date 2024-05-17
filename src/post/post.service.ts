import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async createPost(userId: number, dto: CreatePostDto) {
    try {
      const post = await this.prisma.post.create({
        data: {
          content: dto.content,
          authorId: userId,
        },
      });
      return post;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('internal server error');
    }
  }

  // TODO データ数が大きくなるとパフォーマンスが低下するのでページネーションの実装が必要
  async getManyPosts() {
    try {
      const posts = await this.prisma.post.findMany();
      if (!posts || posts.length === 0) {
        throw new NotFoundException('posts not found');
      }
      // 投稿を新しい順に並び替える
      posts.reverse();
      return posts;
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException('database error');
      } else {
        throw error;
      }
    }
  }

  async getOnePost(postId: number) {
    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });
      if (!post) {
        throw new NotFoundException('post not found');
      }
      return post;
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException('database error');
      } else {
        throw error;
      }
    }
  }

  async getMyPosts(userId: number) {
    try {
      const posts = await this.prisma.post.findMany({
        where: { authorId: userId },
      });
      if (!posts || posts.length === 0) {
        throw new NotFoundException('posts not found');
      }
      posts.reverse();
      return posts;
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException('database error');
      } else {
        throw error;
      }
    }
  }

  async deletePost(userId: number, postId: number) {
    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new NotFoundException('post not found');
      }

      if (post.authorId !== userId) {
        throw new ForbiddenException('you are not the author of this post');
      }

      const aiPost = await this.prisma.postToAipost.findMany({
        where: { postId: postId },
      });

      if (aiPost.length) {
        throw new ForbiddenException('AI融合に使用された投稿は削除できません');
      }

      await this.prisma.post.delete({
        where: { id: postId },
      });
      return post;
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException('database error');
      } else {
        throw error;
      }
    }
  }
}
