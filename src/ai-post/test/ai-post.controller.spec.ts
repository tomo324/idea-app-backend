import { Test, TestingModule } from '@nestjs/testing';
import { AiPostController } from '../ai-post.controller';
import { AiPostService } from '../ai-post.service';

describe('AiPostController', () => {
  let controller: AiPostController;
  let service: AiPostService;

  const mockAiPostService = {
    generateAiPost: jest.fn().mockResolvedValue({
      content: 'test AI content',
    }),
    createAiPost: jest.fn().mockResolvedValue({
      id: 1,
      content: 'test AI content',
    }),
    getManyAiPosts: jest.fn().mockResolvedValue([
      {
        id: 1,
        content: 'test AI content',
      },
      {
        id: 2,
        content: 'test AI content',
      },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiPostController],
      providers: [{ provide: AiPostService, useValue: mockAiPostService }],
    }).compile();

    controller = module.get<AiPostController>(AiPostController);
    service = module.get<AiPostService>(AiPostService);
  });

  it('コントローラが定義されていること', () => {
    expect(controller).toBeDefined();
  });

  it('AI投稿を生成でき、生成したAI投稿を返すこと', async () => {
    const result = await controller.generateAiPost();
    expect(service.generateAiPost).toHaveBeenCalled();
    expect(result).toEqual({ content: 'test AI content' });
  });

  it('生成されたコンテンツを投稿でき、それを返すこと', async () => {
    const createAiPostDto = {
      content: 'test AI content',
    };
    const result = await controller.createAiPost(createAiPostDto);
    expect(service.createAiPost).toHaveBeenCalledWith(createAiPostDto);
    expect(result).toEqual({ id: 1, content: 'test AI content' });
  });

  it('AI投稿を取得できること', async () => {
    const result = await controller.getManyAiPosts();
    expect(service.getManyAiPosts).toHaveBeenCalled();
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
