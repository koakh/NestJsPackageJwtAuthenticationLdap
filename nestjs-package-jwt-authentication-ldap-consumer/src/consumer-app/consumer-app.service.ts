import { JwtSecrets } from '@koakh/nestjs-package-jwt-authentication-ldap';
import { ConsumerAppService as ConsumerAppServiceInterface } from '@koakh/nestjs-package-jwt-authentication-ldap';
import { Injectable } from '@nestjs/common';
import { randomSecret } from '../utils';

@Injectable()
export class ConsumerAppService implements ConsumerAppServiceInterface {
  // inMemory jwtSecrets
  private jwtSecrets: JwtSecrets;

  constructor() {
    this.initRenewTokenSecrets();
  }

  // test function
  getWelcome(name: string) {
    return `hello ${name}`;
  }

  // proxy function to injected licenseService
  async licenseState() {
    // used only in c3-updater, here we can always respond with licenseActivated: true
    return { licenseActivated: true };
  }

  initRenewTokenSecrets(): JwtSecrets {
    this.jwtSecrets = {
      accessTokenJwtSecret: randomSecret(),
      refreshTokenJwtSecret: randomSecret(),
    };
    return this.jwtSecrets;
  }

  getJwtSecrets(): JwtSecrets {
    return this.jwtSecrets;
  }
}
