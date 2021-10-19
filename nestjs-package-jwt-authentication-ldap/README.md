# README

README in [GitHub: NestJsPackageJwtAuthentication](https://github.com/koakh/NestJsPackageJwtAuthentication/blob/main/README.md)

## Create a test package

```shell
# bootstrap a new nest test app
$ nest new test
$ cd test
# install deps
$ npm i
$ npm i @koakh/nestjs-package-jwt-authentication-ldap @nestjs/config
# edit AppModule
$ code src/app.module.ts
```

add `AuthModule` and `ConfigModule` from `@koakh/nestjs-package-jwt-authentication-ldap` and `@nestjs/config`

`src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@koakh/nestjs-package-jwt-authentication-ldap';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule { }
```

add a `test/.env` file

```conf
HTTP_SERVER_PORT="3010"
ACCESS_TOKEN_JWT_SECRET="secretKeyAccessToken"
ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_JWT_SECRET="secretKeyRefreshToken"
REFRESH_TOKEN_EXPIRES_IN="7d"
REFRESH_TOKEN_SKIP_INCREMENT_VERSION="false"
LDAP_ADDRESS="192.168.1.1:2210"
LDAP_BIND_DN="cn=administrator,cn=users,dc=c3edu,dc=online"
LDAP_BIND_CREDENTIALS="Root123..."
LDAP_SEARCH_BASE="dc=c3edu,dc=online"
LDAP_SEARCH_USER_FILTER="(cn={{username}})"
LDAP_SEARCH_USER_ATTRIBUTES="cn,userPrincipalName,displayName,memberOf,userAccountControl,objectCategory,mail,lastLogonTimestamp,gender,C3UserRole,dateOfBirth,studentID,telephoneNumber"
LDAP_SEARCH_CACHE_FILTER="(objectCategory=CN=Person,CN=Schema,CN=Configuration,DC=c3edu,DC=online)"
LDAP_BASE_DN="dc=c3edu,dc=online"
LDAP_NEW_USER_DN_POSTFIX="ou=C3student,ou=People"
OPENAPI_TITLE="Consumer App"
OPENAPI_DESCRIPTION="Koakh NestJS Jwt Authentication Package LDAP Consumer App"
OPENAPI_VERSION="1.0.0"
OPENAPI_TAG="nestjs, typescript, ldap, auth, security"
```

## Run App

TypeError: Cannot read property 'toString' of undefined
Cannot read property 'toString' of undefined

## Test Endpoints

```shell
# clone client.http
wget https://raw.githubusercontent.com/koakh/NestJsPackageJwtAuthentication/main/client.http
```

> Note: required the awesome [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

now test all requests

or test with a simple curl 

```shell
$ curl --request POST \
  --url http://localhost:3010/auth/login \
  --header 'content-type: application/json' \
  --header 'user-agent: vscode-restclient' \
  --data '{"username": "admin","password": "12345678"}' \
  | jq

{
  "user": {
    "id": "efeed3eb-c0a2-4b3e-816f-2a42ca8451b3",
    "username": "admin",
    "firstName": "Pietra",
    "lastName": "Heine",
    "email": "pheine0@illinois.edu",
    "roles": [
      "USER",
      "ADMIN"
    ],
    "createdDate": 1597444307,
    "metaData": {
      "key": "value"
    }
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9........"
}
```

we are done
