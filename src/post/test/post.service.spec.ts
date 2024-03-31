import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from '../post.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('PostService', () => {
  let service: PostService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    post: {
      create: jest.fn().mockResolvedValue({
        id: 1,
        content: 'test content',
        authorId: 1,
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 1,
          content: 'test content',
          authorId: 1,
        },
        {
          id: 2,
          content: 'test content',
          authorId: 1,
        },
      ]),
      findUnique: jest.fn().mockResolvedValue({
        id: 1,
        content: 'test content',
        authorId: 1,
      }),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('serviceが定義されていること', () => {
    expect(service).toBeDefined();
  });
  it('投稿を作成でき、作成した投稿を返すこと', async () => {
    const userId = 1;
    const createPostDto = {
      content: 'test content',
    };
    const result = await service.createPost(userId, createPostDto);
    expect(prismaService.post.create).toHaveBeenCalledWith({
      data: {
        content: createPostDto.content,
        authorId: userId,
      },
    });
    expect(result).toEqual({
      id: 1,
      content: 'test content',
      authorId: 1,
    });
  });
  it('投稿を複数取得でき、取得した投稿を返すこと', async () => {
    const result = await service.getManyPosts();
    expect(prismaService.post.findMany).toHaveBeenCalled();
    expect(result).toEqual([
      {
        id: 1,
        content: 'test content',
        authorId: 1,
      },
      {
        id: 2,
        content: 'test content',
        authorId: 1,
      },
    ]);
  });
  it('特定の投稿を取得でき、取得した投稿を返すこと', async () => {
    const postId = 1;
    const result = await service.getOnePost(postId);
    expect(prismaService.post.findUnique).toHaveBeenCalledWith({
      where: { id: postId },
    });
    expect(result).toEqual({
      id: 1,
      content: 'test content',
      authorId: 1,
    });
  });
  it('自分の投稿を複数取得でき、取得した投稿を返すこと', async () => {
    const userId = 1;
    const result = await service.getMyPosts(userId);
    expect(prismaService.post.findMany).toHaveBeenCalledWith({
      where: { authorId: userId },
    });
    expect(result).toEqual([
      {
        id: 1,
        content: 'test content',
        authorId: 1,
      },
      {
        id: 2,
        content: 'test content',
        authorId: 1,
      },
    ]);
  });
  it('投稿を削除できること', async () => {
    const userId = 1;
    const postId = 1;
    await service.deletePost(userId, postId);
    expect(prismaService.post.delete).toHaveBeenCalledWith({
      where: { id: postId },
    });
  });
});
