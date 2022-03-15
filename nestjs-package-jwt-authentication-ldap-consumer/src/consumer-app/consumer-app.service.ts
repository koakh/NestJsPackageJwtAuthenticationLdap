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

  // stub to implement
  getJwtSecrets(): JwtSecrets {
    return this.jwtSecrets;
  }

  // stub to implement
  // singleSignOn(req: any, res: any): any {
  //   return {};
  // }

  // stub to implement
  changePassword(username: string, password: string): any {
    return { username, password };
  }

  // stub to implement
  onCreateUserRecord(): void {
    console.log('fired onCreateUserRecord event.....');
  }

  onChangeUserRecord(): void {
    console.log('fired onChangeUserRecord event.....');
  }
  
  onDeleteUserRecord(): void {
    console.log('fired onDeleteUserRecord event.....');
  }

  onAddOrDeleteUserToGroup(): void {
    console.log('fired onAddOrDeleteUserToGroup event.....');
  }

  onChangeUserProfilePassword(): void {
    console.log('fired onChangeUserProfilePassword event.....');
  }

  onUpdateDefaultGroup(): void {
    console.log('fired onUpdateDefaultGroup event.....');
  }

  onCreateGroupRecord(): void {
    console.log('fired onCreateGroupRecord event.....');
  }

  onDeleteGroupRecord(): void {
    console.log('fired onDeleteGroupRecord event.....');
  }

}
