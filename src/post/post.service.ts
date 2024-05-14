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
      // 投稿を新しい順に並び替える
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
        throw new Error('cannot find post');
      }
      if (post.authorId !== userId) {
        throw new Error('you are not the author of the post');
      }
      const aiPost = await this.prisma.postToAipost.findMany({
        where: { postId: postId },
      });
      if (aiPost.length) {
        throw new Error('this post is used in AI post');
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
