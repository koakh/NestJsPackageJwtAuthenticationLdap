import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@koakh/nestjs-package-jwt-authentication-ldap';
import { ConfigModule } from '@nestjs/config';
import { ConsumerAppModule } from './consumer-app/consumer-app.module';
import { ConfigService } from '@nestjs/config';
import { ConsumerAppService } from './consumer-app/consumer-app.service';

@Module({
  imports: [
    // config module
    ConfigModule.forRoot({ isGlobal: true, }),
    // the trick is import the module, not the service here, this will expose AppController to
    // AuthModule,
    AuthModule.forRootAsync(AuthModule, {
      imports: [ConfigModule, ConsumerAppModule],
      inject: [ConfigService, ConsumerAppService],
      useFactory: (config: ConfigService, consumerAppService: ConsumerAppService) => {
        return {
          consumerAppService,
          config: {
            jwt: {
              accessTokenJwtSecret: config.get<string>('ACCESS_TOKEN_JWT_SECRET', 'secretKeyAccessToken'),
              accessTokenExpiresIn: config.get<string>('ACCESS_TOKEN_EXPIRES_IN', '30m'),
              refreshTokenJwtSecret: config.get<string>('REFRESH_TOKEN_JWT_SECRET', 'secretKeyRefreshToken'),
              refreshTokenExpiresIn: config.get<string>('REFRESH_TOKEN_EXPIRES_IN', '7d'),
              refreshTokenSkipIncrementVersion: config.get<string>('REFRESH_TOKEN_SKIP_INCREMENT_VERSION', 'false'),
            },
            // TODO: this can be an anonymous function of a core ACTION_CONFIG_GET result :) or a static from configService
            ldap: {
              address: config.get<string>('LDAP_URL', 'localhost'),
              port: config.get<string | number>('LDAP_PORT', 389),
              usersBaseSearch: config.get<string>('LDAP_USERS_BASE_SEARCH', ''),
              baseDN: config.get<string>('LDAP_BASE_DN', 'dc=c3edu,dc=online'),
              baseAdmin: config.get<string>('ACCESS_TOKEN_JWT_SECRET', 'cn=administrator,cn=users'),
              bindDN: config.get<string>('LDAP_BIND_DN', 'cn=administrator,cn=users,dc=c3edu,dc=online'),
              rootUser: config.get<string>('LDAP_ROOT_USER', 'c3'),
              bindCredentials: config.get<string>('LDAP_BIND_CREDENTIALS', 'somesecretpassword'),
              searchBase: config.get<string>('LDAP_SEARCH_BASE', 'ou=People,dc=c3edu,dc=online'),
              searchUserFilterStrategy: config.get<string>('LDAP_SEARCH_USER_FILTER_STRATEGY', '(cn={{username}})'),
              searchUserFilter: config.get<string>('LDAP_SEARCH_USER_FILTER', '(cn=${username})'),
              searchUserAttributes: config.get<string>('LDAP_SEARCH_USER_ATTRIBUTES', 'cn,userPrincipalName,displayName,memberOf,userAccountControl,objectCategory,distinguishedName,mail,lastLogonTimestamp,gender,C3UserRole,dateOfBirth,studentID,telephoneNumber'),
              searchGroupFilter: config.get<string>('LDAP_SEARCH_GROUP_FILTER', '(cn=${groupName})'),
              searchGroupAttributes: config.get<string>('LDAP_SEARCH_GROUP_ATTRIBUTES', 'dn,cn,name,memberOf,objectCategory,distinguishedName'),
              searchGroupPrefix: config.get<string>('LDAP_SEARCH_GROUP_PREFIX', 'C3'),
              searchGroupExcludeGroups: config.get<string>('LDAP_SEARCH_GROUP_EXCLUDE_GROUPS', 'C3Developer,Domain Admins'),
              // TODO: new
              searchGroupExcludeRolesGroups: config.get<string>('LDAP_SEARCH_GROUP_EXCLUDE_ROLES_GROUPS', 'Domain Admins'),
              searchCacheFilter: config.get<string>('LDAP_SEARCH_CACHE_FILTER', '(objectCategory=CN=Person,CN=Schema,CN=Configuration,DC=c3edu,DC=online)'),
              newUserDnPostfix: config.get<string>('LDAP_NEW_USER_DN_POSTFIX', 'ou=People'),
              roleAdmin: config.get<string>('AUTH_ADMIN_ROLE', 'C3_ADMINISTRATOR'),
            }
          }
        };
      },
    }),
    // TODO
    // ConsumerAppModule,
  ],
  controllers: [AppController],
  // require to use app AppService in DI
  // else Nest can't resolve dependencies of the AppController (?). Please make sure that the argument AppService at index [0] is available in the AppModule context
  providers: [AppService],
  exports: []
})

export class AppModule { }
