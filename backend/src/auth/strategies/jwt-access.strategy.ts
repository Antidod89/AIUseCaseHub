import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

// Стратегия для проверки access токена
@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          if (req?.cookies?.accessToken) {
            return req.cookies.accessToken;
          }
          const header = req.headers['authorization'];
          if (!header) return null;
          const [type, token] = header.split(' ');
          return type === 'Bearer' ? token : null;
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')
    });
  }

  async validate(payload: JwtPayload) {
    return payload;
  }
}

