import { createConfigurableDynamicRootModule } from '@golevelup/nestjs-modules';
import { CookieParserMiddleware } from '@nest-middlewares/cookie-parser';
import { Global, MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AUTH_OPTIONS, CONFIG_SERVICE, CONSUMER_APP_SERVICE } from '../common/constants';
import { HttpExceptionFilter } from '../common/filters';
import { ModuleOptionsConfig } from '../common/interfaces';
import { ModuleOptions } from '../common/interfaces/module-options.interface';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LdapController } from './ldap/ldap.controller';
import { LdapService } from './ldap/ldap.service';
import { JwtStrategy, LdapStrategy, RolesStrategy } from './strategy';

@Global()
// TODO: trick#1 must be here else fails in JwtService, and don't export expose all controllers and services
@Module({
  exports: [AuthService, LdapService, CONFIG_SERVICE],
  controllers: [AuthController, LdapController],
  providers: [AuthService, JwtStrategy, LdapStrategy, RolesStrategy, LdapService],
  imports: [
    JwtModule.registerAsync({
      inject: [CONFIG_SERVICE],
      useFactory: async (
        config: ModuleOptionsConfig,
      ) => ({
        secret: config.auth.accessTokenJwtSecret,
        signOptions: { expiresIn: config.auth.accessTokenExpiresIn },
      }),
    }),
  ],
})
export class AuthModule extends createConfigurableDynamicRootModule<AuthModule, ModuleOptions>(AUTH_OPTIONS, {
  // TODO: trick#1 KO, here don't export expose all controllers and services
  // exports: [AuthService, LdapService, CONFIG_SERVICE],
  // controllers: [AuthController, LdapController],
  // dynamic module injected custom providers
  providers: [
    // AuthService, JwtStrategy, LdapStrategy, RolesStrategy, LdapService,
    // register a global-scoped filter directly from any module
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      inject: [AUTH_OPTIONS],
      provide: CONSUMER_APP_SERVICE,
      useFactory: (options: ModuleOptions) => options.consumerAppService,
    },
    {
      inject: [AUTH_OPTIONS],
      provide: CONFIG_SERVICE,
      useFactory: (options: ModuleOptions) => options.config,
    },
  ],
}) {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CookieParserMiddleware).forRoutes('/auth/refresh-token');
  }
}
