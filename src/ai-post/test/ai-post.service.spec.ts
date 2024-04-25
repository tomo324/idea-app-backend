import { Test, TestingModule } from '@nestjs/testing';
import { AiPostService } from '../ai-post.service';
import { PrismaService } from 'src/prisma/prisma.service';
import prismaRandom from 'prisma-extension-random';
import OpenAI from 'openai';
import * as deepl from 'deepl-node';

// TODO 正しくモックされるようにする。
// 現状ではモックされずに実際のOpenAI APIが呼ばれてしまう
jest.mock('deepl-node', () => {
  return {
    Translator: jest.fn().mockImplementation(() => {
      return {
        translateText: jest.fn().mockResolvedValue({
          text: 'Translated text',
          detectedSourceLang: 'ja',
        }),
      };
    }),
  };
});

{
  /* 
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [
                {
                  text: 'test AI content',
                },
              ],
            }),
          },
        },
      };
    }),
  };
});
*/
}

describe('AiPostService', () => {
  let service: AiPostService;
  let prismaService: PrismaService;
  let openai: OpenAI;
  let translator: deepl.Translator;

  const mockPrismaService = {
    aipost: {
      create: jest.fn().mockResolvedValue({
        id: 1,
        content: 'AIコンテンツ',
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 1,
          content: 'AIコンテンツ',
        },
        {
          id: 2,
          content: 'AIコンテンツ',
        },
      ]),
    },
    $extends: jest.fn().mockImplementation(() => ({
      post: {
        findManyRandom: jest.fn().mockResolvedValue([
          {
            id: 1,
            content: 'コンテンツ1',
          },
          {
            id: 2,
            content: 'コンテンツ2',
          },
        ]),
      },
    })),
  };

  const mockTranslator = new deepl.Translator('dummy');

  const mockOpenai = {
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              text: 'test AI content',
            },
          ],
        }),
      },
    },
  };

  //const mockOpenai = new OpenAI({ apiKey: 'dummy' });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiPostService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: OpenAI, useValue: mockOpenai },
        { provide: deepl.Translator, useValue: mockTranslator },
      ],
    }).compile();

    service = module.get<AiPostService>(AiPostService);
    prismaService = module.get<PrismaService>(PrismaService);
    openai = module.get<OpenAI>(OpenAI);
    translator = module.get<deepl.Translator>(deepl.Translator);
  });

  it('サービスが定義されていること', () => {
    expect(service).toBeDefined();
  });

  it('ランダムに選んだ投稿からAI投稿を生成でき、生成したAI投稿を返すこと', async () => {
    const result = await service.generateAiPost();
    // TODO ここでランダムに選んだ投稿を取得していることを確認
    //expect(prismaService.post.findManyRandom).toHaveBeenCalled();

    // ChatGPTに投げる前にDeepL APIを使って英語に翻訳
    expect(translator.translateText).toHaveBeenCalled();
    expect(openai.chat.completions.create).toHaveBeenCalled();
    expect(result).toEqual({
      choices: [
        {
          text: 'AI コンテンツ',
        },
      ],
    });
  });

  it('生成されたコンテンツを投稿でき、それを返すこと', async () => {
    const aiContent = 'test AI content';
    const result = await service.createAiPost({ content: aiContent });
    expect(prismaService.aipost.create).toHaveBeenCalledWith({
      data: {
        content: aiContent,
      },
    });
    expect(result).toEqual({
      id: 1,
      content: 'test AI content',
    });
  });

  it('AI投稿を取得できること', async () => {
    const result = await service.getManyAiPosts();
    expect(prismaService.aipost.findMany).toHaveBeenCalled();
    expect(result).toEqual([
      {
        id: 1,
        content: 'test AI content',
      },
      {
        id: 2,
        content: 'test AI content',
      },
    ]);
  });
});
