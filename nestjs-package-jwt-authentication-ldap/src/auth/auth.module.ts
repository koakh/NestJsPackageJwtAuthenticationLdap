import { CookieParserMiddleware } from '@nest-middlewares/cookie-parser';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { envConstants } from '../common/constants/env';
import { HttpExceptionFilter } from '../common/filters';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LdapService } from './ldap/ldap.service';
import { JwtStrategy, LdapStrategy, LocalStrategy } from './strategy';
import { LdapController } from './ldap/ldap.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get(envConstants.ACCESS_TOKEN_JWT_SECRET),
        signOptions: { expiresIn: configService.get(envConstants.ACCESS_TOKEN_EXPIRES_IN) },
      }),
      inject: [ConfigService],
    }),
    UserModule,
  ],
  providers: [
    // register a global-scoped filter directly from any module
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    AuthService, UserService, LocalStrategy, JwtStrategy, LdapStrategy, LdapService,
  ],
  exports: [AuthService],
  controllers: [AuthController, LdapController],
})

export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CookieParserMiddleware).forRoutes('/auth/refresh-token');
  }
}
