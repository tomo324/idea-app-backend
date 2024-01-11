import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GetUserInterface } from '../interface';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const req: Express.Request | GetUserInterface = ctx
      .switchToHttp()
      .getRequest();
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
