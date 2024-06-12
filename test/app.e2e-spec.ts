import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { SignupDto, SigninDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import fastifyCookie from '@fastify/cookie';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import fastifyCsrf from '@fastify/csrf-protection';

describe('App e2e', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let cookie: any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.register(fastifyCookie, {
      secret: process.env.COOKIE_SECRET,
    });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.register(helmet);
    app.enableCors({
      origin:
        process.env.NODE_ENV === 'production'
          ? 'https://aidea-park.vercel.app'
          : 'http://localhost:3000',
      methods: 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
      credentials: true,
    });
    await app.register(fastifyCsrf);
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    describe('Signup', () => {
      const signupDto: SignupDto = {
        email: 'tomo@gmail.com',
        password: '123456',
        name: 'tomo',
      };
      it('メールが空の場合、エラーになること', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: signupDto.password,
            name: signupDto.name,
          })
          .expectStatus(400);
      });
      it('パスワードが空の場合、エラーになること', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: signupDto.email,
            name: signupDto.name,
          })
          .expectStatus(400);
      });
      it('名前が空の場合、エラーになること', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: signupDto.email,
            password: signupDto.password,
          })
          .expectStatus(400);
      });
      it('リクエストボディが与えられない場合、エラーになること', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
      it('サインアップができること', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(signupDto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      const signinDto: SigninDto = {
        email: 'tomo@gmail.com',
        password: '123456',
      };
      it('メールが空の場合、エラーになること', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: signinDto.password,
          })
          .expectStatus(400);
      });
      it('パスワードが空の場合、エラーになること', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: signinDto.email,
          })
          .expectStatus(400);
      });
      it('リクエストボディが与えられない場合、エラーになること', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });

      it('サインインができること', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(signinDto)
          .returns((ctx) => {
            cookie = ctx.res.headers['set-cookie'];
          })
          .expectStatus(200);
      });
    });
  });

  describe('Post', () => {
    const postDto = {
      content: 'test',
    };
    describe('Create', () => {
      it('postが空の場合、エラーになること', () => {
        return pactum
          .spec()
          .post('/posts/create')
          .withCookies(cookie[0])
          .expectStatus(400);
      });

      it('postを投稿できること', () => {
        return pactum
          .spec()
          .post('/posts/create')
          .withCookies(cookie[0])
          .withBody(postDto)
          .stores((request, response) => {
            return {
              postId: response.body.id,
            };
          })
          .expectStatus(201);
      });
    });

    describe('Get', () => {
      it('post一覧を取得できること', () => {
        return pactum
          .spec()
          .get('/posts')
          .withCookies(cookie[0])
          .expectStatus(200);
      });

      it('postのidからpostを取得できること', () => {
        return pactum
          .spec()
          .get('/posts/$S{postId}')
          .withCookies(cookie[0])
          .expectStatus(200);
      });

      it('自分の投稿一覧を取得できること', () => {
        return pactum
          .spec()
          .get('/posts/my-posts')
          .withCookies(cookie[0])
          .expectStatus(200);
      });
    });

    describe('Delete', () => {
      it('postを削除できること', () => {
        return pactum
          .spec()
          .delete('/posts/$S{postId}')
          .withCookies(cookie[0])
          .expectStatus(200);
      });
    });
  });

  describe('User', () => {
    const dto: EditUserDto = {
      email: 'tomo2@gmail.com',
      name: 'tomo2',
    };

    describe('Get me', () => {
      it('現在のユーザー情報を取得できること', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withCookies(cookie[0])
          .expectStatus(200)
          .stores('userId', 'id');
      });
    });

    describe('Get username by id', () => {
      it('idからユーザー名を取得できること', () => {
        return pactum
          .spec()
          .get('/users/$S{userId}')
          .withCookies(cookie[0])
          .expectStatus(200)
          .expectBodyContains('tomo');
      });
    });

    describe('Edit user', () => {
      it('ユーザー情報を編集できること', () => {
        return pactum
          .spec()
          .patch('/users')
          .withCookies(cookie[0])
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.email)
          .expectBodyContains(dto.name);
      });
    });

    describe('Delete user', () => {
      it('ユーザーを削除できること', () => {
        return pactum
          .spec()
          .delete('/users')
          .withCookies(cookie[0])
          .withBody(dto)
          .expectStatus(200);
      });

      it('削除されたユーザー情報を取得できないこと', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withCookies(cookie[0])
          .expectStatus(401);
      });
    });
  });
});
