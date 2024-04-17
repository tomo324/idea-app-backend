import { Test, TestingModule } from '@nestjs/testing';
import { AiPostService } from '../ai-post.service';
import { PrismaService } from 'src/prisma/prisma.service';
import OpenAI from 'openai';

describe('AiPostService', () => {
  let service: AiPostService;
  let prismaService: PrismaService;
  let openai: OpenAI;
  let aiContent: string;

  const mockPrismaService = {
    post: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 1,
          content: 'test content',
        },
        {
          id: 2,
          content: 'test content',
        },
      ]),
    },
    aipost: {
      create: jest.fn().mockResolvedValue({
        id: 1,
        content: 'test AI content',
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 1,
          content: 'test AI content',
        },
        {
          id: 2,
          content: 'test AI content',
        },
      ]),
    },
  };

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiPostService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: OpenAI, useValue: mockOpenai },
      ],
    }).compile();

    service = module.get<AiPostService>(AiPostService);
    prismaService = module.get<PrismaService>(PrismaService);
    openai = module.get<OpenAI>(OpenAI);
  });

  it('サービスが定義されていること', () => {
    expect(service).toBeDefined();
  });

  it('ランダムに選んだ投稿からAI投稿を生成でき、生成したAI投稿を返すこと', async () => {
    const result = await service.generateAiPost();
    expect(prismaService.post.findMany).toHaveBeenCalled();
    expect(openai.chat.completions.create).toHaveBeenCalled();
    expect(result).toEqual({
      choices: [
        {
          text: 'test AI content',
        },
      ],
    });
    aiContent = result.choices[0].text;
  });

  it('生成されたコンテンツを投稿でき、それを返すこと', async () => {
    const result = await service.createAiPost(aiContent);
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
