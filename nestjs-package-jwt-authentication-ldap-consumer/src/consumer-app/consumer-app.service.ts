import { ConsumerAppService as ConsumerAppServiceInterface } from '@koakh/nestjs-package-jwt-authentication-ldap';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConsumerAppService implements ConsumerAppServiceInterface {
  getWelcome(name: string) {
    return `hello ${name}`;
  }  
}
