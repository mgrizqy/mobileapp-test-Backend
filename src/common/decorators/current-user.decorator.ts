// Custom decorator to extract the current user from the JWT payload.
// Usage: @CurrentUser() user — gives you { userId, role } in any controller.
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
