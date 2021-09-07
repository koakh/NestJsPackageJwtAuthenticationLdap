import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  debugger;
  // require return type to prevent bellow error
  // tslint:disable-next-line: max-line-length
  // The inferred type of 'canActivate' cannot be named without a reference to '../../../../../../../../../../media/mario/storage/Home/Documents/Development/Node/@NestJsPackages/TypescriptNestJsPackageJwtAuthenticationLdap/nestjs-package-jwt-authentication-ldap/node_modules/rxjs'. This is likely not portable. A type annotation is necessary.ts(2742)
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (info) {
      let errorMessage;
      switch (info.message) {
        case 'jwt expired':
          errorMessage = `${info.message}: ${info.expiredAt}`
          Logger.error(errorMessage, null, JwtAuthGuard.name);
          break;
        default:
          Logger.error(info.message ? info.message : info, null, JwtAuthGuard.name);
          break;
      }
      // const message = `${info.message} at ${info.expiredAt}`;
      throw new UnauthorizedException(info.message);
    }
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user ;
  }
}