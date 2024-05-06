import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto';

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
      throw error;
    }
  }

  // TODO データ数が大きくなるとパフォーマンスが低下するのでページネーションの実装が必要
  async getManyPosts() {
    try {
      const posts = await this.prisma.post.findMany();
      posts.reverse();
      return posts;
    } catch (error) {
      throw error;
    }
  }

  async getOnePost(postId: number) {
    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });
      return post;
    } catch (error) {
      throw error;
    }
  }

  async getMyPosts(userId: number) {
    try {
      const posts = await this.prisma.post.findMany({
        where: { authorId: userId },
      });
      posts.reverse();
      return posts;
    } catch (error) {
      throw error;
    }
  }

  async deletePost(userId: number, postId: number) {
    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });
      if (!post) {
        throw new Error('投稿が見つかりません');
      }
      if (post.authorId !== userId) {
        throw new Error('投稿の削除権限がありません');
      }
      await this.prisma.post.delete({
        where: { id: postId },
      });
      return post;
    } catch (error) {
      throw error;
    }
  }
}
