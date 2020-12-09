// import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
// import { Observable } from 'rxjs';

// @Injectable()
// export class RolesAuthGuard extends AuthGuard('roles') {
//   // require return type to prevent bellow error
//   // tslint:disable-next-line: max-line-length
//   // The inferred type of 'canActivate' cannot be named without a reference to '../../../../../../../../../../media/mario/storage/Home/Documents/Development/Node/@NestJsPackages/TypescriptNestJsPackageJwtAuthenticationLdap/nestjs-package-jwt-authentication-ldap/node_modules/rxjs'. This is likely not portable. A type annotation is necessary.ts(2742)
//   canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
//     // Add your custom authentication logic here
//     // for example, call super.logIn(request) to establish a session.
//     return super.canActivate(context);
//   }

//   handleRequest(err, user, info) {
//     // You can throw an exception based on either "info" or "err" arguments
//     debugger;
//     if (info) {
//       Logger.error(info, RolesAuthGuard.name);
//       // const message = `${info.message} at ${info.expiredAt}`;
//       throw new UnauthorizedException(info.message);
//     }
//     if (err || !user) {
//       throw err || new UnauthorizedException();
//     }
//     return user;
//   }
// }

import { Injectable, CanActivate, ExecutionContext, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    // get roles from metaData ex `'C3Administrator', 'C3Student'`
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      return false;
    };
    // get jwt injected user from request
    const user = request.user;
    // check if user have guard required role
    return this.matchRoles(roles, user.roles);
  }

  matchRoles(roles: string[], userRoles: string[]): boolean {
    let result = false;
    roles.forEach((e) => {
      if (userRoles.includes(e)) {
        result = true;
      };
    });
    return result;
  }
}