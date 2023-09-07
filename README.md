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

## Required Tooling

```shell
# used version on c3 and dev machine both works
$ node -v
v10.19.0
$ node -v
v16.6.2
# require
$ sudo npm install -g @nestjs/cli nodemon
```

## Checkout Project

```shell
$ git clone https://github.com/koakh/NestJsPackageJwtAuthenticationLdap.git
$ cd NestJsPackageJwtAuthenticationLdap
```

## Start/Build Development Package

```shell
# in terminal #1
$ cd nestjs-package-jwt-authentication-ldap
# optional, only if checkout project
$ npm i --legacy-peer-deps
$ npm run start:dev
[10:27:42 AM] Starting compilation in watch mode...
[10:27:48 AM] Found 0 errors. Watching for file changes.
# done running in watch mode
```

## Start Consumer App

```shell
# in terminal #2
$ cd nestjs-package-jwt-authentication-ldap-consumer
# optional to use local package remove `"@koakh/nestjs-package-jwt-authentication-ldap": "^1.0.21"` from `package.json`,
# else leave package.json and use latest published version
$ npm i ../nestjs-package-jwt-authentication-ldap/
# optional, only if checkout project
$ npm i
# DEPRECATED
# start in dev or debug (this will debug consumer app)
$ npm run start:dev | debug
# or
$ npm run start:debug

# check `Debugger attached.` in terminal #2

# now launch `Attach to Process` debugger configuration

# or ctrl+c and `Launch Program` debugger configuration
# F5, this will  this will debug package and comsumer app ate same time
```

to test debugger breakpoint and breakpoint in bellow line `const { user: { cn: username, userPrincipalName: email, dn: userId, memberOf } } = req;`

```shell
@Controller('auth')
@ApiTags('auth')
export class AuthController {
  ...
  async login(
    @Request() req: LoginDto,
    @Response() res,
  ): Promise<LoginResponseDto> {
    // ADD BREAKPOINT HERE
    const { user: { cn: username, userPrincipalName: email, dn: userId, memberOf } } = req;
```

now launch one request to hit the breakpoint

```shell
$ curl --request POST \
  --url https://127.0.0.1/backend/v1/auth/login \
  --header 'content-type: application/json' \
  --header 'user-agent: vscode-restclient' \
  --data '{"username": "student1","password": "1234"}'
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
