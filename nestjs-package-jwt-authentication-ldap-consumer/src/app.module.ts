import { AuthModule } from '@koakh/nestjs-package-jwt-authentication-ldap';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConsumerAppModule } from './consumer-app/consumer-app.module';
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
            auth: {
              authShowAccessTokenProps: config.get<boolean>('AUTH_SHOW_ACCESS_TOKEN_PROPS', false),
              authSecretKey: config.get<string>('AUTH_SECRET_KEY', '4LGHe209gmlJtQwP7FfM89hMNzOCqrNg'),
              accessTokenJwtSecret: config.get<string | { (): string }>('ACCESS_TOKEN_JWT_SECRET', () => consumerAppService.getJwtSecrets().accessTokenJwtSecret),
              refreshTokenJwtSecret: config.get<string | { (): string }>('REFRESH_TOKEN_JWT_SECRET', () => consumerAppService.getJwtSecrets().refreshTokenJwtSecret),
              accessTokenExpiresIn: config.get<string>('ACCESS_TOKEN_EXPIRES_IN', '30m'),
              refreshTokenExpiresIn: config.get<string>('REFRESH_TOKEN_EXPIRES_IN', '7d'),
              refreshTokenSkipIncrementVersion: config.get<boolean>('REFRESH_TOKEN_SKIP_INCREMENT_VERSION', false),
              roleAdmin: config.get<string>('AUTH_ADMIN_ROLE', 'C3_ADMINISTRATOR'),
              rolePermittedUnlicensedPermissionGroups: config.get<string>('AUTH_ADMIN_ROLE_PERMITTED_UNLICENSED_PERMISSION_GROUPS', 'RP_LICENSE,RP_INTERNET_ACCESS,RP_TIME_CONFIGURATION,RP_WIRELESS,RP_LOCAL_AREA_NETWORK'),
            },
            ldap: {
              address: config.get<string>('LDAP_ADDRESS', 'localhost'),
              port: config.get<string | number>('LDAP_PORT', 389),
              usersBaseSearch: config.get<string>('LDAP_USERS_BASE_SEARCH', ''),
              baseDN: config.get<string>('LDAP_BASE_DN', 'dc=c3edu,dc=online'),
              baseAdmin: config.get<string>('LDAP_BASE_ADMIN', 'cn=administrator,cn=users'),
              bindDN: config.get<string>('LDAP_BIND_DN', 'cn=administrator,cn=users,dc=c3edu,dc=online'),
              rootUser: config.get<string>('LDAP_ROOT_USER', 'c3'),
              bindCredentials: config.get<string>('LDAP_BIND_CREDENTIALS', 'somesecretpassword'),
              searchBase: config.get<string>('LDAP_SEARCH_BASE', 'ou=People,dc=c3edu,dc=online'),
              searchUserFilterStrategy: config.get<string>('LDAP_SEARCH_USER_FILTER_STRATEGY', '(cn={{username}})'),
              searchUserFilter: config.get<string>('LDAP_SEARCH_USER_FILTER', '(cn=${username})'),
              searchUserAttributes: config.get<string>('LDAP_SEARCH_USER_ATTRIBUTES', 'cn,givenName,sn,displayName,userPrincipalName,memberOf,userAccountControl,objectCategory,distinguishedName,mail,lastLogonTimestamp,gender,c3UserRole,dateOfBirth,studentID,telephoneNumber,extraPermission'),
              searchGroupFilter: config.get<string>('LDAP_SEARCH_GROUP_FILTER', '(cn=${groupName})'),
              searchGroupAttributes: config.get<string>('LDAP_SEARCH_GROUP_ATTRIBUTES', 'dn,cn,name,memberOf,objectCategory,distinguishedName,permission'),
              searchGroupProfilesPrefix: config.get<string>('LDAP_SEARCH_GROUP_PROFILES_PREFIX', 'C3'),
              searchGroupPermissionsPrefix: config.get<string>('LDAP_SEARCH_GROUP_PERMISSIONS_PREFIX', 'RP'),
              searchGroupExcludeProfileGroups: config.get<string>('LDAP_SEARCH_GROUP_EXCLUDE_PROFILE_GROUPS', 'C3Developer'),
              searchGroupExcludePermissionGroups: config.get<string>('LDAP_SEARCH_GROUP_EXCLUDE_PERMISSION_GROUPS', ''),
              searchCacheFilter: config.get<string>('LDAP_SEARCH_CACHE_FILTER', '(objectCategory=CN=Person,CN=Schema,CN=Configuration,DC=c3edu,DC=online)'),
              newUserDnPostfix: config.get<string>('LDAP_NEW_USER_DN_POSTFIX', 'ou=People'),
            }
          }
        };
      },
    }),
  ],
  // enable AppController controller only to test it in package development, in publish package this must be disabled
  controllers: [/*AppController*/],
  // require to use app AppService in DI
  // else Nest can't resolve dependencies of the AppController (?). Please make sure that the argument AppService at index [0] is available in the AppModule context
  providers: [/*AppService, ConsumerAppService*/],
  exports: []
})

export class AppModule { }
