import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SigninDto, SignupDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}
  async signup(signupDto: SignupDto) {
    // パスワードをハッシュ化する
    const hash = await argon.hash(signupDto.password);
    // ユーザーを作成する
    try {
      const user = await this.prisma.user.create({
        data: {
          email: signupDto.email,
          name: signupDto.name,
          hash,
        },
      });
      return this.signToken(user.id, user.email);
    } catch (error) {
      console.error(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email already exists');
        }
      }
      throw error;
    }
  }

  async signin(signinDto: SigninDto) {
    try {
      // メールアドレスからユーザーを取得する
      const user = await this.prisma.user.findUnique({
        where: {
          email: signinDto.email,
        },
      });
      // ユーザーが存在しない場合は例外をスローする
      if (!user) {
        throw new ForbiddenException('Credentials incorrect');
      }

      // パスワードが一致するか確認する
      const pwMatches = await argon.verify(user.hash, signinDto.password);
      // パスワードが一致しない場合は例外をスローする
      if (!pwMatches) {
        throw new ForbiddenException('Credentials incorrect');
      }
      return this.signToken(user.id, user.email);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async signToken(userId: number, email: string) {
    const secret = this.config.get('JWT_SECRET');
    const payload = {
      sub: userId,
      email,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });
    return accessToken;
  }
}
