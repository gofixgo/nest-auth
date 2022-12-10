import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ReqUser = createParamDecorator((_: unknown, ctx: ExecutionContext): IUserAuth => {
  const req = ctx.switchToHttp().getRequest();
  return req.user;
});
