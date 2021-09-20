import { Injectable } from '@nestjs/common';
import { AuthService } from '@koakh/nestjs-package-jwt-authentication-ldap';

@Injectable()
export class AppService {
  constructor(
    private readonly authService: AuthService,
  ) { }

  // test use authService from library
  hashPassword(password: string): string {
    return this.authService.hashPassword(password);
  }
}
