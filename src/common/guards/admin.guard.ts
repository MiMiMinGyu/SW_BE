import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserType } from '../../users/enums/user-type.enum';

interface UserPayload {
  id: number;
  email: string;
  userType: UserType;
}

interface AuthenticatedRequest {
  user: UserPayload;
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('인증이 필요합니다.');
    }

    if (user.userType !== UserType.ADMIN) {
      throw new ForbiddenException('관리자 권한이 필요합니다.');
    }

    return true;
  }
}
