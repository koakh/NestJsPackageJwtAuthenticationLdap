import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { CONFIG_SERVICE } from '../../common/constants';
import { ModuleOptionsConfig } from '../../common/interfaces';

@Injectable()
export class SecretKeyAuthGuard implements CanActivate {
  constructor(
    @Inject(CONFIG_SERVICE)
    private readonly config: ModuleOptionsConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const secretKey = request.params?.secretKey;

    // Check if secret key is provided and matches the configured secret key
    if (!secretKey || secretKey !== this.config.auth.authSecretKey) {
      throw new UnauthorizedException('Invalid or missing secret key');
    }

    return true;
  }
}
