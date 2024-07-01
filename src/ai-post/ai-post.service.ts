import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAiPostDto } from './dto';
import prismaRandom from 'prisma-extension-random';
import OpenAI from 'openai';
import * as deepl from 'deepl-node';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Post } from 'src/post/interface';

@Injectable()
export class AiPostService {
  private prisma;

  constructor(private prismaService: PrismaService) {
    this.prisma = this.prismaService.$extends(prismaRandom());
  }

  async generateAiPostRandom() {
    // 投稿をランダムに取得する
    // TODO 型エラーを直す
    const posts: any = await this.prisma.post.findManyRandom(2, {
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
      },
    });
    if (!posts || posts.length === 0) {
      throw new NotFoundException('Posts not found');
    }
    const aiPost = await this.generate(posts);
    return aiPost;
  }

  async generateAiPostWith(postId: number) {
    const selectedPost = await this.prisma.post.findUnique({
      where: { id: postId },
    });
    if (!selectedPost) {
      throw new NotFoundException('Post not found');
    }
    const randomPost: any = await this.prisma.post.findManyRandom(1, {
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
      },
    });
    if (!randomPost || randomPost.length === 0) {
      throw new NotFoundException('Random post not found');
    }
    const aiPost = await this.generate([selectedPost, randomPost[0]]);
    return aiPost;
  }

  async createAiPost(dto: CreateAiPostDto) {
    try {
      const aiPost = await this.prisma.aipost.create({
        data: {
          content: dto.content,
          post_to_aiposts: {
            create: [
              {
                post: {
                  connect: { id: dto.firstPostId },
                },
              },
              {
                post: {
                  connect: { id: dto.secondPostId },
                },
              },
            ],
          },
        },
      });
      return aiPost;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async getManyAiPosts() {
    try {
      const rawAiPosts = await this.prisma.aipost.findMany({
        include: {
          post_to_aiposts: {
            include: {
              post: true,
            },
          },
        },
      });

      if (!rawAiPosts || rawAiPosts.length === 0) {
        throw new NotFoundException('AI posts not found');
      }

      // 中間テーブルの情報を削除する
      const aiPosts = rawAiPosts.map((aiPost) => {
        const { post_to_aiposts, ...rest } = aiPost;
        const posts = post_to_aiposts.map(({ post }) => post);
        return { ...rest, posts };
      });

      // 投稿を新しい順に並び替える
      aiPosts.reverse();
      return aiPosts;
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException('database error');
      } else {
        throw error;
      }
    }
  }

  async getRelatedAiPosts(postId: number) {
    try {
      const rawAiPosts = await this.prisma.aipost.findMany({
        where: {
          post_to_aiposts: {
            some: {
              postId: postId,
            },
          },
        },
        include: {
          post_to_aiposts: {
            include: {
              post: true,
            },
          },
        },
      });
      if (!rawAiPosts || rawAiPosts.length === 0) {
        throw new NotFoundException('AI posts not found');
      }

      const aiPosts = rawAiPosts.map((aiPost) => {
        const { post_to_aiposts, ...rest } = aiPost;
        const posts = post_to_aiposts.map(({ post }) => post);
        return { ...rest, posts };
      });

      aiPosts.reverse();
      return aiPosts;
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException('database error');
      } else {
        throw error;
      }
    }
  }

  async deleteAiPost(aiPostId: number) {
    try {
      await this.prisma.postToAipost.deleteMany({
        where: { aipostId: aiPostId },
      });
      await this.prisma.aipost.delete({
        where: { id: aiPostId },
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async translateTextToEnglish(text: string) {
    if (!process.env.DEEPL_API_KEY) {
      throw new BadRequestException('DEEPL_API_KEY is not set');
    }
    const deeplAuthKey = process.env.DEEPL_API_KEY;
    const translator = new deepl.Translator(deeplAuthKey);
    try {
      const result = await translator.translateText(text, null, 'en-US');
      return result.text;
    } catch (error) {
      console.error(error);
      if (error instanceof deepl.DeepLError) {
        throw new BadRequestException('Failed to translate text to English');
      } else {
        throw error;
      }
    }
  }

  async translateTextToJapanese(text: string) {
    if (!process.env.DEEPL_API_KEY) {
      throw new BadRequestException('DEEPL_API_KEY is not set');
    }
    const deeplAuthKey = process.env.DEEPL_API_KEY;
    const translator = new deepl.Translator(deeplAuthKey);
    try {
      const result = await translator.translateText(text, null, 'ja');
      return result.text;
    } catch (error) {
      console.error(error);
      if (error instanceof deepl.DeepLError) {
        throw new BadRequestException('Failed to translate text to Japanese');
      } else {
        throw error;
      }
    }
  }

  async useChatGPT(firstPost: string, secondPost: string) {
    if (!process.env.CHATGPT_API_KEY) {
      throw new BadRequestException('CHATGPT_API_KEY is not set');
    }
    const openai = new OpenAI({
      apiKey: process.env.CHATGPT_API_KEY,
    });
    const gpt_prompt =
      'Combine the two ideas above to create a new idea. Answer in 230 characters or less.';
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: `1: ${firstPost}, 2: ${secondPost}, ${gpt_prompt}`,
          },
        ],
        model: 'gpt-3.5-turbo',
        max_tokens: 150,
      });
      if (!completion.choices || completion.choices.length === 0) {
        throw new BadRequestException('Failed to generate AI post');
      }
      return completion.choices[0].message.content;
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw new BadRequestException('Failed to connect to OpenAI API');
      } else {
        throw error;
      }
    }
  }

  async generate(posts: Post[]) {
    if (posts.length < 2) {
      throw new BadRequestException('Not enough posts to generate AI post');
    }

    // 投稿を英語に翻訳する
    const englishFirstPost = await this.translateTextToEnglish(
      posts[0].content,
    );
    const englishSecondPost = await this.translateTextToEnglish(
      posts[1].content,
    );

    // ChatGPTを使って新しいアイデアを生成する
    const chatGPTResponse = await this.useChatGPT(
      englishFirstPost,
      englishSecondPost,
    );

    if (!chatGPTResponse) {
      throw new BadRequestException('Failed to generate AI post');
    }

    // ChatGPTの結果を日本語に翻訳する
    const japaneseChatGPTResponse =
      await this.translateTextToJapanese(chatGPTResponse);

    return { content: japaneseChatGPTResponse, posts };
  }
}
