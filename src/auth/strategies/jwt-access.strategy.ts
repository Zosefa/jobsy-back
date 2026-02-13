import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AUTH_REPOSITORY } from '../domain/auth.repository';
import type { AuthRepository } from '../domain/auth.repository';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
const cookieExtractor = (req: Request) => req?.cookies?.access_token ?? null;

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(
    config: ConfigService,
    @Inject(AUTH_REPOSITORY) private readonly repo: AuthRepository,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    // payload contient: sub, role, sid, jti, exp...
    const revoked = await this.repo.findRevokedAccessToken(payload.jti);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (revoked && revoked.expiresAt > new Date()) {
      throw new UnauthorizedException('Token révoqué');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return payload;
  }
}
