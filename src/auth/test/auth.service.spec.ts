import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import * as argon from 'argon2';

jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockPrismaService = {
    user: {
      create: jest.fn().mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      }),
      findUnique: jest.fn().mockResolvedValue({
        id: 1,
        email: 'test@example.com',
      }),
    },
  };

  const mockJwtService = {
    signAsync: jest
      .fn()
      .mockResolvedValue('signed-jwt-token'),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('jwt-secret'),
  };

  // 外部ライブラリのモックを作成
  (argon.hash as jest.Mock).mockReturnValue(
    'argontest-hash',
  );

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          AuthService,
          {
            provide: PrismaService,
            useValue: mockPrismaService,
          },
          {
            provide: JwtService,
            useValue: mockJwtService,
          },
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

    service =
      module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(
      PrismaService,
    );
    jwtService =
      module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(
      ConfigService,
    );
  });

  describe('AuthService', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('signup', () => {
    it('should create a new user and return the access token', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'test123',
        name: 'Test User',
      };

      const result = await service.signup(dto);

      expect(
        prismaService.user.create,
      ).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          name: dto.name,
          hash: expect.any(String),
        },
      });
      expect(result).toEqual({
        access_token: 'signed-jwt-token',
      });
    });
  });

  describe('signin', () => {
    it('should return an access token for valid credentials', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'test123',
        name: 'Test User',
      };

      // 外部ライブラリのモックを作成
      (argon.verify as jest.Mock).mockReturnValue(
        true,
      );

      const result = await service.signin(dto);

      expect(
        prismaService.user.findUnique,
      ).toHaveBeenCalledWith({
        where: {
          email: dto.email,
        },
      });
      expect(result).toEqual({
        access_token: 'signed-jwt-token',
      });
    });
  });

  describe('signToken', () => {
    it('should return a signed jwt token', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
      };

      const result = await service.signToken(
        user.id,
        user.email,
      );

      expect(
        jwtService.signAsync,
      ).toHaveBeenCalledWith(
        {
          sub: user.id,
          email: user.email,
        },
        {
          expiresIn: '15m',
          secret: 'jwt-secret',
        },
      );

      expect(result).toEqual({
        access_token: 'signed-jwt-token',
      });
    });
  });
});
