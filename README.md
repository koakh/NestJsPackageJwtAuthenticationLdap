# README

## Links

- [GitHub: NestJsPackageJwtAuthenticationLdap](https://github.com/koakh/NestJsPackageJwtAuthenticationLdap)

based on

- [GitHub: NestJsPackageJwtAuthentication](https://github.com/koakh/NestJsPackageJwtAuthentication)
- [NPM: NestJsPackageJwtAuthentication](https://www.npmjs.com/package/@koakh/nestjs-package-jwt-authentication-ldap)
- Based on [NestJsPackageStarter](https://github.com/koakh/NestJsPackageStarter)

**NestJsPackageJwtAuthenticationLdap** is a simple nestjs package to easy bootstrap jwt with ldap authentication in nestjs projects.
this project have a `nestjs-package-jwt-authentication-ldap` **nestjs package**, and package consumer app `nestjs-package-jwt-authentication-ldap-consumer`, nodemon configured on both package and app, hot reload, vscode debugger on package and on consumer app ready to roll

> NOTE: please read notes from above repo links

## Start/Build Development Package

```shell
# in terminal #1
$ cd nestjs-package-jwt-authentication-ldap
$ npm run start:dev
```

## Start Consumer App

```shell
# in terminal #2
$ cd nestjs-package-jwt-authentication-ldap-consumer
# start in dev or debug
$ npm run start:dev
$ npm run start:debug
```

## Develop both projects

Now develop nestjs package and consumer app with hot reload

## Test all endpoints with client.http file

> Note: required the awesome [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
