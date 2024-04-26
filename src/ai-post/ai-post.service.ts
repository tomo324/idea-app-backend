import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAiPostDto } from './dto';
import prismaRandom from 'prisma-extension-random';
import OpenAI from 'openai';
import * as deepl from 'deepl-node';

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
      select: { id: true, content: true, authorId: true },
    });
    if (posts.length < 2) {
      throw new Error('Not enough posts to generate AI post');
    }

    const originalPosts = posts.map(
      (post: { id: number; content: string; authorId: number }) => {
        return { id: post.id, content: post.content, authorId: post.authorId };
      },
    );

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
      throw new Error('ChatGPT response is empty');
    }

    // ChatGPTの結果を日本語に翻訳する
    const translatedChatGPTResponse =
      await this.translateTextToJapanese(chatGPTResponse);

    return { content: translatedChatGPTResponse, originalPosts };
  }

  async createAiPost(dto: CreateAiPostDto) {
    try {
      const aiPost = await this.prisma.aipost.create({
        data: {
          content: dto.content,
        },
      });
      return aiPost;
    } catch (error) {
      throw new Error('Failed to create AI post');
    }
  }

  async getManyAiPosts() {
    try {
      const posts = await this.prisma.aipost.findMany();
      return posts;
    } catch (error) {
      throw new Error('Failed to get AI posts');
    }
  }

  async translateTextToEnglish(text: string) {
    const deeplAuthKey = process.env.DEEPL_API_KEY;
    if (!deeplAuthKey) {
      throw new Error('DEEPL_API_KEY is not set');
    }
    const translator = new deepl.Translator(deeplAuthKey);
    try {
      const result = await translator.translateText(text, null, 'en-US');
      return result.text;
    } catch (error) {
      throw new Error('Failed to translate text to English');
    }
  }

  async translateTextToJapanese(text: string) {
    const deeplAuthKey = process.env.DEEPL_API_KEY;
    if (!deeplAuthKey) {
      throw new Error('DEEPL_API_KEY is not set');
    }
    const translator = new deepl.Translator(deeplAuthKey);
    try {
      const result = await translator.translateText(text, null, 'ja');
      return result.text;
    } catch (error) {
      throw new Error('Failed to translate text to Japanese');
    }
  }

  async useChatGPT(firstPost: string, secondPost: string) {
    const openai = new OpenAI({
      apiKey: process.env.CHATGPT_API_KEY,
    });
    if (!openai) {
      throw new Error('CHATGPT_API_KEY is not set');
    }
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

      return completion.choices[0].message.content;
    } catch (error) {
      throw new Error('Failed to generate AI post');
    }
  }
}
