import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface UserPayload {
  id: number;
  email: string;
}

interface AuthenticatedRequest {
  user: UserPayload;
}

export const GetUser = createParamDecorator(
  (
    data: keyof UserPayload | undefined,
    ctx: ExecutionContext,
  ): UserPayload | number | string | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      return undefined;
    }

    return data ? user[data] : user;
  },
);
