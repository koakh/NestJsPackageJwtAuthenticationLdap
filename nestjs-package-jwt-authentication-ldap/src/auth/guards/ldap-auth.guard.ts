import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

// this is required and important, this will put ldap working

@Injectable()
// DEPRECATED: now we need to extend the AuthGuard('ldap'), to better errorHandling and work with disabled users
// always outputs "error": "Unauthorized" only
// export class LdapAuthGuard extends AuthGuard('ldap') {}

export class LdapAuthGuard extends AuthGuard('ldap') {
  private readonly logger = new Logger(LdapAuthGuard.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(
    err: any,
    user: any,
    info: any,
  ): any {
    // Handle JWT-related errors
    if (info) {
      let errorMessage: string;
      // current detected messages
      // "Account disabled"
      // "Invalid username/password"
      switch (info.message) {
        // used for working with other type of messages
        // case 'jwt expired':
        //   errorMessage = `JWT expired: ${info.expiredAt}`;
        //   this.logger.error(errorMessage);
        //   break;
        default:
          errorMessage = info.message || JSON.stringify(info);
          this.logger.error(errorMessage);
          break;
      }

      throw new UnauthorizedException(errorMessage);
    }

    // Handle other authentication errors
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication failed');
    }

    return user;
  }
}
