import {
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Guard для проверки access JWT токена
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt-access') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Необходима авторизация');
    }
    return user;
  }
}

