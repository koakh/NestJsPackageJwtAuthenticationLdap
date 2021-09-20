import { ConsumerAppService as ConsumerAppServiceInterface } from '@koakh/nestjs-package-jwt-authentication-ldap';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConsumerAppService implements ConsumerAppServiceInterface {
  getWelcome(username: string) {
    return `hello ${username} from ${ConsumerAppService.name}`;
  }  
}
