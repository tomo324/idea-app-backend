import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    signup: jest.fn().mockResolvedValue({
      access_token: 'signed-jwt-token',
    }),
    signin: jest.fn().mockResolvedValue({
      access_token: 'signed-jwt-token',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [AuthController],
        providers: [AuthService],
      })
        .overrideProvider(AuthService)
        .useValue(mockAuthService)
        .compile();

    controller = module.get<AuthController>(
      AuthController,
    );
  });

  describe('AuthController', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('signup', () => {
    it('should call singup function in service and return the access_token', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'test123',
        name: 'Test User',
      };

      const result = await controller.signup(dto);

      expect(
        mockAuthService.signup,
      ).toHaveBeenCalledWith(dto);

      expect(result).toEqual({
        access_token: 'signed-jwt-token',
      });
    });
  });

  describe('signin', () => {
    it('should call signin function and return the access_token', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'test123',
        name: 'Test User',
      };

      const result = await controller.signin(dto);

      expect(
        mockAuthService.signin,
      ).toHaveBeenCalledWith(dto);

      expect(result).toEqual({
        access_token: 'signed-jwt-token',
      });
    });
  });
});
