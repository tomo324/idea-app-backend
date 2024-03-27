import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from '../post.controller';
import { PostService } from '../post.service';

describe('PostController', () => {
  let controller: PostController;

  const mockPostService = {
    createPost: jest.fn().mockResolvedValue({
      id: 1,
      content: 'test content',
      userId: 1,
    }),
    getManyPosts: jest.fn().mockResolvedValue([
      {
        id: 1,
        content: 'test content',
        userId: 1,
      },
      {
        id: 2,
        content: 'test content',
        userId: 1,
      },
    ]),
    getOnePost: jest.fn().mockResolvedValue({
      id: 1,
      content: 'test content',
      userId: 1,
    }),
    getManyPostsByUserId: jest.fn().mockResolvedValue([
      {
        id: 1,
        content: 'test content',
        userId: 1,
      },
      {
        id: 2,
        content: 'test content',
        userId: 1,
      },
    ]),
    deletePost: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [PostService],
    })
      .overrideProvider(PostService)
      .useValue(mockPostService)
      .compile();

    controller = module.get<PostController>(PostController);
  });

  it('controllerが定義されていること', () => {
    expect(controller).toBeDefined();
  });

  it('createPostメソッドが呼ばれ、作成したpostが返されること', async () => {
    const userId = 1;
    const createPostDto = {
      content: 'test content',
    };

    const post = await controller.createPost(userId, createPostDto);

    expect(mockPostService.createPost).toHaveBeenCalledWith(
      userId,
      createPostDto,
    );

    expect(post).toEqual({
      id: 1,
      content: 'test content',
      userId: 1,
    });
  });
  it('getManyPostsメソッドが呼ばれ、post一覧が返されること', async () => {
    const posts = await controller.getManyPosts();

    expect(mockPostService.getManyPosts).toHaveBeenCalled();

    expect(posts).toEqual([
      {
        id: 1,
        content: 'test content',
        userId: 1,
      },
      {
        id: 2,
        content: 'test content',
        userId: 1,
      },
    ]);
  });
  it('getOnePostメソッドが呼ばれ、postが返されること', async () => {
    const postId = 1;

    const post = await controller.getOnePost(postId);

    expect(mockPostService.getOnePost).toHaveBeenCalledWith(postId);

    expect(post).toEqual({
      id: 1,
      content: 'test content',
      userId: 1,
    });
  });
  it('getManyPostsByUserIdメソッドが呼ばれ、post一覧が返されること', async () => {
    const userId = 1;

    const posts = await controller.getManyPostsByUserId(userId);

    expect(mockPostService.getManyPostsByUserId).toHaveBeenCalledWith(userId);

    expect(posts).toEqual([
      {
        id: 1,
        content: 'test content',
        userId: 1,
      },
      {
        id: 2,
        content: 'test content',
        userId: 1,
      },
    ]);
  });
  it('deletePostメソッドが呼ばれること', async () => {
    const postId = 1;

    await controller.deletePost(postId);

    expect(mockPostService.deletePost).toHaveBeenCalledWith(postId);
  });
});
