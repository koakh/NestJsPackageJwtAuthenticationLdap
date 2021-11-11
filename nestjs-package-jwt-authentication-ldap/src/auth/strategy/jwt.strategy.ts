import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CONFIG_SERVICE } from '../../common/constants';
import { ModuleOptionsConfig } from '../../common/interfaces';
import { JwtValidatePayload } from '../interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(CONFIG_SERVICE)
    private readonly config: ModuleOptionsConfig,
  ) {
    // pass injected services to parent constructor
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // opt#1: static secret
      // secretOrKey: config.auth.refreshTokenJwtSecret,
      // opt#2: use secretOrKeyProvider instead of secretOrKey, this way we can asynchronously access the secret dynamically
      secretOrKeyProvider: (request, jwtToken, done) => {
        const secret = config.auth.accessTokenJwtSecret instanceof Function
          ? config.auth.accessTokenJwtSecret()
          : config.auth.accessTokenJwtSecret
        done(null, secret);
      },
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtValidatePayload) {
    return { userId: payload.sub, username: payload.username, roles: payload.roles, permissions: payload.permissions, metaData: payload.metaData };
  }
}
