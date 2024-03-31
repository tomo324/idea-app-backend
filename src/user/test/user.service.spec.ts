import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      update: jest.fn().mockResolvedValue({
        id: 1,
        email: 'test@google.com',
        name: 'Test User',
        hash: 'test-hash',
        createdAt: '2024-01-20T08:35:19.637Z',
        updatedAt: '2024-01-20T08:35:19.637Z',
      }),
      delete: jest.fn(),
    },
    post: { deleteMany: jest.fn() },
    $transaction: jest
      .fn()
      .mockImplementation((promises) => Promise.all(promises)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('UserService', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('editUser', () => {
    it('should call update and return a updated user', async () => {
      const userId = 1;
      const dto = {
        email: 'test@gmail.com',
        name: 'Test User',
      };

      const result = await service.editUser(userId, dto);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { ...dto },
      });

      expect(result).toEqual({
        id: userId,
        email: 'test@google.com',
        name: 'Test User',
        createdAt: '2024-01-20T08:35:19.637Z',
        updatedAt: '2024-01-20T08:35:19.637Z',
      });
    });
  });

  describe('deleteUser', () => {
    it('should call delete with userId', async () => {
      const userId = 1;

      await service.deleteUser(userId);

      expect(prismaService.$transaction).toHaveBeenCalledWith([
        prismaService.post.deleteMany({ where: { authorId: userId } }),
        prismaService.user.delete({ where: { id: userId } }),
      ]);
    });
  });
});
