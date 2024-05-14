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

@Injectable()
export class AiPostService {
  private prisma;

  constructor(private prismaService: PrismaService) {
    this.prisma = this.prismaService.$extends(prismaRandom());
  }

  async generateAiPost() {
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

    if (posts.length < 2) {
      throw new BadRequestException('Not enough posts to generate AI post');
    }

    // 投稿を英語に翻訳する
    const translatedFirstPost = await this.translateTextToEnglish(
      posts[0].content,
    );
    const translatedSecondPost = await this.translateTextToEnglish(
      posts[1].content,
    );

    // ChatGPTを使って新しいアイデアを生成する
    const chatGPTResponse = await this.useChatGPT(
      translatedFirstPost,
      translatedSecondPost,
    );

    if (!chatGPTResponse) {
      throw new BadRequestException('Failed to generate AI post');
    }

    // ChatGPTの結果を日本語に翻訳する
    const translatedChatGPTResponse =
      await this.translateTextToJapanese(chatGPTResponse);

    return { content: translatedChatGPTResponse, posts };
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
      let aiPosts;
      aiPosts = await this.prisma.aipost.findMany({
        include: {
          post_to_aiposts: {
            include: {
              post: true,
            },
          },
        },
      });

      if (!aiPosts || aiPosts.length === 0) {
        throw new NotFoundException('AI posts not found');
      }

      // 必要な情報だけを取り出す
      aiPosts = aiPosts.map((aiPost) => {
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
}
