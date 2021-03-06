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
# DEPRECATED
# start in dev or debug (this will debug consumer app)
# $ npm run start:dev
# $ npm run start:debug
# this will debug package and comsumer app ate same time
press F5 or launch debugger
```

to test consumer app uncomment `hashPassword` and launch debugger and fire `curl http://localhost:3010/v1`

```typescript
// sample: test debugger consumer app with `curl http://localhost:3010/v1`
@Get()
@ApiOkResponse({ description: 'The request has succeeded' })
hashPassword(): string {
  debugger;
  const password = 'some fake data';
  return this.appService.hashPassword(password);
}
```

to test package add a `debugger;` in login, and launch debugger and fire `curl -X POST --url http://localhost:3010/v1/auth/login --header 'content-type: application/json' --data '{"username": "c3","password": "root"}'`

```typescript
async login(
  @Request() req: LoginDto,
  @Response() res,
): Promise<LoginResponseDto> {
  debugger;
```

## Develop both projects

Now develop nestjs package and consumer app with hot reload

## Test all endpoints with client.http file

> Note: required the awesome [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

## Create Admin User

```shell
$ USER="mario"
$ sudo samba-tool user list
$ sudo samba-tool user create ${USER} password
# test user auth ${​USER}​:root
$ ldapsearch -H ldap://localhost:389 -x -D "cn=${​USER}​,cn=users,dc=c3edu,dc=online" -w "root" -b ou=passport-ldapauth "(uid=${​USER}​)"
# show user
$ sudo samba-tool user show ${​USER}​
$ sudo samba-tool group addmembers "C3Administrator" ${​USER}​
$ sudo samba-tool group listmembers "C3Administrator"
```
