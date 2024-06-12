import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GetUserInterface } from '../interface';
import { FastifyRequest } from 'fastify';

interface RequestWithUser extends FastifyRequest {
  user: GetUserInterface;
}

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const req: RequestWithUser = ctx.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      return null;
    }

    if (data) {
      return user[data];
    }
    return user;
  },
);
