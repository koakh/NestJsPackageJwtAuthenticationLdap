import { ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

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

      switch (info.message) {
        case 'jwt expired':
          errorMessage = `JWT expired: ${info.expiredAt}`;
          this.logger.error(errorMessage);
          break;
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
