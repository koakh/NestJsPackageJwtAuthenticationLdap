import { ConsumerAppService as ConsumerAppServiceInterface } from '@koakh/nestjs-package-jwt-authentication-ldap';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConsumerAppService implements ConsumerAppServiceInterface {
  // test function
  getWelcome(name: string) {
    return `hello ${name}`;
  }

  // proxy function to injected licenseService
  async licenseState() {
    // used only in c3-updater, here we can always respond with licenseActivated: true
    return { licenseActivated: true };
  }
}
