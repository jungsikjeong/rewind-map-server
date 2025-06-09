import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { AuthJwtPayload } from '../interfaces/auth-payload.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => {
        const cookie = req.headers.cookie as string;
        const refreshToken = cookie?.toLowerCase().replace('refreshToken=', '');
        return refreshToken;
      },
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  validate(payload: AuthJwtPayload): { userId: number; nickname: string } {
    return { userId: payload.sub, nickname: payload.nickname };
  }
}
