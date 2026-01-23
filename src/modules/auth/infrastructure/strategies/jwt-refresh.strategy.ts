import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtPayload } from '@auth/application/services';

interface RefreshTokenBody {
  refreshToken: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    const secretOrKey = configService.get<string>('jwt.refreshSecret');
    if (!secretOrKey) {
      throw new Error('JWT refresh secret is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey,
      passReqToCallback: true,
    });
  }

  validate(
    req: Request<unknown, unknown, RefreshTokenBody>,
    payload: JwtPayload,
  ) {
    const refreshToken = req.body.refreshToken;
    return {
      userId: payload.sub,
      email: payload.email,
      refreshToken,
    };
  }
}
