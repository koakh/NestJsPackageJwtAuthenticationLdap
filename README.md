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
# used version on c3
$ node -v
v10.19.0
# require
$ sudo npm install -g @nestjs/cli
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
$ npm i
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
$ npm run start:dev
# or
$ npm run start:debug
ERROR [ExceptionHandler] Nest can\'t resolve dependencies of the RolesAuthGuard (?). Please make sure that the argument Reflector at index [0] is available in the AuthModule context.

Potential solutions:
- If Reflector is a provider, is it part of the current AuthModule?
- If Reflector is exported from a separate @Module, is that module imported within AuthModule?
  @Module({
    imports: [ /* the Module containing Reflector */ ]
  })
# to fix this jump to ## UPDATE 2021-10-19 15:34:39 section

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

## UPDATE 2021-10-19 15:34:39 : Fix ERROR [ExceptionHandler] Nest can't resolve dependencies of the RolesAuthGuard (?). Please make sure that the argument Reflector at index [0] is available in the AuthModule context.

seems that somehow we are having so much pain with this error (again), better to close eyes and use a less elegant way

trick to solve this problem is:

1. checkout the project, and install with `npm -i` with current published `"@koakh/nestjs-package-jwt-authentication-ldap": "^1.0.21"` package
2. `cd nestjs-package-jwt-authentication-ldap && npm i`
3. `cd nestjs-package-jwt-authentication-ldap-consumer && npm run start:debug` after run the consumer app, it runs without issues


mario@links-laptop ~/D/@/n/@/@/N/n/n/@koakh (main)> ln -s ../../../nestjs-package-jwt-authentication-ldap/
mario@links-laptop ~/D/@/n/@/@/N/n/n/@koakh (main)> ls -la
total 24
drwxr-xr-x   2 mario users  4096 Oct 19 16:59 .
drwxr-xr-x 516 mario users 20480 Oct 19 16:48 ..
lrwxrwxrwx   1 mario users    48 Oct 19 16:59 nestjs-package-jwt-authentication-ldap -> ../../../nestjs-package-jwt-authentication-ldap/
try hard with symbolic links with and without absolute path and seems it is a loose fight

cp ../../../nestjs-package-jwt-authentication-ldap . -R
cd node_modules/@koakh/nestjs-package-jwt-authentication-ldap/
# else it will keep installing local package
nestjs-package-jwt-authentication-ldap-consumer> rm package-lock.json
npm i

# required
npm i






cd nestjs-package-jwt-authentication-ldap-consumer/node_modules/@koakh/
mv nestjs-package-jwt-authentication-ldap nestjs-package-jwt-authentication-ldap_online
# SYMBOLIC LINKS WILL FAIL
ln -s ../../../nestjs-package-jwt-authentication-ldap

npm run start:dev
Error: Cannot find module '@nestjs/common'
    at Function.Module._resolveFilename (internal/modules/cjs/loader.js:636:15)

but copy works
rsync -r -t -v --progress -s ../../../nestjs-package-jwt-authentication-ldap .
npm run start:dev

leave "@koakh/nestjs-package-jwt-authentication-ldap": "^1.0.21", in package.json


add ../nestjs-package-jwt-authentication-ldap-consumer/node_modules/@koakh/nestjs-package-jwt-authentication-ldap/dist to 
nestjs-package-jwt-authentication-ldap-consumer/nodemon-debug.json

"watch": ["src", "../nestjs-package-jwt-authentication-ldap/dist", "../nestjs-package-jwt-authentication-ldap-consumer/node_modules/@koakh/nestjs-package-jwt-authentication-ldap/dist"],

now fix the debugger adding 
"${workspaceFolder}/nestjs-package-jwt-authentication-ldap-consumer/node_modules/@koakh/nestjs-package-jwt-authentication-ldap/dist/**/*.js"

    {
      "type": "pwa-node",
      "name": "Attach to Process",
      "port": 9239,
      "request": "attach",
      "skipFiles": [
        "<node_internals>/**"
      ],
      "sourceMaps": true,
      "outFiles": [
        "${workspaceFolder}/nestjs-package-jwt-authentication-ldap/dist/**/*.js",
        "${workspaceFolder}/nestjs-package-jwt-authentication-ldap-consumer/dist/**/*.js",
        "${workspaceFolder}/nestjs-package-jwt-authentication-ldap-consumer/node_modules/@koakh/nestjs-package-jwt-authentication-ldap/dist/**/*.js"
      ],

git config --global user.email "marioammonteiro@gmail.com"
git config --global user.name "Mário Monteiro"


sudo apt-get install -y mongodb-mongosh

apareceu apos instalr o $ npm i -D @types/express fuck

[Nest] 539583  - 10/19/2021, 3:28:33 PM   ERROR [ExceptionHandler] Nest can't resolve dependencies of the RolesAuthGuard (?). Please make sure that the argument Reflector at index [0] is available in the AuthModule context.

Potential solutions:
- If Reflector is a provider, is it part of the current AuthModule?
- If Reflector is exported from a separate @Module, is that module imported within AuthModule?
  @Module({
    imports: [ /* the Module containing Reflector */ ]
  })

mas ao fazer npm i no consumer deu e passou
