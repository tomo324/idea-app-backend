import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    signup: jest.fn().mockResolvedValue('signed-jwt-token'),
    signin: jest.fn().mockResolvedValue('signed-jwt-token'),
  };
  const mockRes = {
    cookie: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    controller = module.get<AuthController>(AuthController);
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

      await controller.signup(dto, mockRes as any);

      expect(mockAuthService.signup).toHaveBeenCalledWith(dto);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'access_token',
        'signed-jwt-token',
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        },
      );
    });
  });

  describe('signin', () => {
    it('should call signin function and return the access_token', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'test123',
      };

      await controller.signin(dto, mockRes as any);

      expect(mockAuthService.signin).toHaveBeenCalledWith(dto);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'access_token',
        'signed-jwt-token',
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        },
      );
    });
  });
});
