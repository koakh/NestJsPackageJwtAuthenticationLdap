import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CONFIG_SERVICE } from '../../common/constants';
import { ModuleOptionsConfig } from '../../common/interfaces';
import { JwtValidatePayload } from '../interfaces';

@Injectable()
export class RolesStrategy extends PassportStrategy(Strategy, 'roles') {
  constructor(
    @Inject(CONFIG_SERVICE)
    private readonly config: ModuleOptionsConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.jwt.accessTokenJwtSecret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtValidatePayload) {
    return { userId: payload.sub, username: payload.username, roles: payload.roles };
  }
}
