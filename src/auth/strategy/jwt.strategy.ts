import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserOptionalHash } from '../interface';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        const accessToken = req.cookies['accessToken'];
        if (!accessToken) {
          return null;
        }
        return accessToken;
      },
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number; email: string }) {
    const user: UserOptionalHash | null = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });
    // ユーザーが存在しない場合はnullを返す
    if (!user) {
      return null;
    }
    delete user.hash;
    return user;
  }
}
