import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';

describe('AuthController', () => {
  let controller: UserController;

  const mockUserService = {
    editUser: jest.fn().mockResolvedValue({
      id: 1,
      email: 'test@google.com',
      name: 'Test User',
      hash: 'test-hash',
      createdAt: '2024-01-20T08:35:19.637Z',
      updatedAt: '2024-01-20T08:35:19.637Z',
    }),
    deleteUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [UserController],
        providers: [UserService],
      })
        .overrideProvider(UserService)
        .useValue(mockUserService)
        .compile();

    controller = module.get<UserController>(
      UserController,
    );
  });

  describe('UserController', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('editUser', () => {
    it('should call editUser function and return the updated user', async () => {
      const userId = 1;
      const dto = {
        email: 'test@gmail.com',
        name: 'test',
      };

      const result = await controller.editUser(
        userId,
        dto,
      );

      expect(
        mockUserService.editUser,
      ).toHaveBeenCalledWith(userId, dto);

      expect(result).toEqual({
        id: userId,
        email: 'test@google.com',
        name: 'Test User',
        hash: 'test-hash',
        createdAt: '2024-01-20T08:35:19.637Z',
        updatedAt: '2024-01-20T08:35:19.637Z',
      });
    });
  });

  describe('deleteUser', () => {
    it('should call deleteUser function', async () => {
      const userId = 1;

      await controller.deleteUser(userId);

      expect(
        mockUserService.deleteUser,
      ).toHaveBeenCalledWith(userId);
    });
  });
});
