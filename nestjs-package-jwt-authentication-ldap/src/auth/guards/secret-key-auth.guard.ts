import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { CONFIG_SERVICE } from '../../common/constants';
import { ModuleOptionsConfig } from '../../common/interfaces';

@Injectable()
export class SecretKeyAuthGuard implements CanActivate {
  constructor(
    @Inject(CONFIG_SERVICE)
    private readonly config: ModuleOptionsConfig,
  ) { }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (request.params && request.params.secretKey !== this.config.auth.authSecretKey) {
      return false;
    }
    return true;
  }
}