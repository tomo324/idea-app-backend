import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { SignupDto, SigninDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
//import axios from 'axios';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

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
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: signupDto.password,
            name: signupDto.name,
          })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: signupDto.email,
            name: signupDto.name,
          })
          .expectStatus(400);
      });
      it('should throw if name empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: signupDto.email,
            password: signupDto.password,
          })
          .expectStatus(400);
      });
      it('should throw if no body provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
      it('should signup', () => {
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
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: signinDto.password,
          })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: signinDto.email,
          })
          .expectStatus(400);
      });
      it('should throw if no body provided', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });

      // TODO ここでsigninしてcookieにaccess_tokenを保存する
      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(signinDto)
          .expectStatus(200);
        //.stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    let cookie: any;

    const dto: EditUserDto = {
      email: 'tomo2@gmail.com',
      name: 'tomo2',
    };

    const signinDto: SigninDto = {
      email: 'tomoo@gmail.com',
      password: '123456',
    };

    // TODO set-cookieヘッダーはauth.controllerでは確認できるが、テスト側では確認できない
    it('get cookie', async () => {
      await pactum
        .spec()
        .post('/auth/signin')
        .withBody(signinDto)
        .returns((ctx) => {
          console.log(ctx.res.headers);
          cookie = ctx.res.headers['set-cookie'];
        });
    });

    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withCookies(cookie[0])
          .expectStatus(200);
      });
    });

    describe('Edit user', () => {
      it('should edit user', () => {
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
      it('should delete user', () => {
        return pactum
          .spec()
          .delete('/users')
          .withCookies(cookie[0])
          .withBody(dto)
          .expectStatus(200);
      });

      it('should not get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withCookies(cookie[0])
          .expectStatus(401);
      });
    });
  });
});
