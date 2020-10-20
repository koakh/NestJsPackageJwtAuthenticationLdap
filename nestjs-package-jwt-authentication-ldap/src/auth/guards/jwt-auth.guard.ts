import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (info) {
      // Logger.error(info, JwtAuthGuard.name);
      throw new UnauthorizedException(`${info.message}`)
    }
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}