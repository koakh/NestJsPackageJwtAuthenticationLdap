# NOTES

- [NOTES](#notes)
  - [Starter Project](#starter-project)
    - [Links](#links)
  - [TLDR](#tldr)
    - [Create tunnel to connect to c3 LDAP](#create-tunnel-to-connect-to-c3-ldap)
    - [Change .env to use tunnel](#change-env-to-use-tunnel)
    - [Debug package and consumer App](#debug-package-and-consumer-app)
    - [Test Api](#test-api)
  - [Read base Starter Notes](#read-base-starter-notes)
  - [LDAP](#ldap)
  - [Use LdapJs](#use-ldapjs)
  - [Example of Search Users with LdapJs](#example-of-search-users-with-ldapjs)
  - [Problems](#problems)
  - [Ignore debug error message](#ignore-debug-error-message)
  - [Missing LDAP Port Forword](#missing-ldap-port-forword)
  - [Extract data from JWT in Endpoints, ex Extract injected User](#extract-data-from-jwt-in-endpoints-ex-extract-injected-user)
  - [Add AuthRoles Guard, Decorator etc](#add-authroles-guard-decorator-etc)
  - [ldapjs Password Change](#ldapjs-password-change)
  - [Install anc Configure OpenApi on consumer App and package](#install-anc-configure-openapi-on-consumer-app-and-package)
    - [Installation](#installation)
    - [Bootstrap](#bootstrap)
    - [Add @ApiProperty() to schemas](#add-apiproperty-to-schemas)

## Starter Project

### Links

- [Publishing NestJS Packages with npm](https://dev.to/nestjs/publishing-nestjs-packages-with-npm-21fm)
- [nestjsplus/nestjs-package-starter](https://github.com/nestjsplus/nestjs-package-starter)
- [Koakh/NestJsPackageStarter](https://github.com/koakh/NestJsPackageStarter)
- [GitHub: NestJsPackageJwtAuthentication](https://github.com/koakh/NestJsPackageJwtAuthentication)
- [NPM: NestJsPackageJwtAuthentication](https://www.npmjs.com/package/@koakh/nestjs-package-jwt-authentication-ldap)

## TLDR

project used node version `node/v12.8.1`

> this notes are the continuation of NOTES.md from [NestJsPackageStarter](https://github.com/koakh/NestJsPackageStarter/blob/main/NOTES.md) and [GitHub: NestJsPackageJwtAuthentication](https://github.com/koakh/NestJsPackageJwtAuthentication)

### Create tunnel to connect to c3 LDAP

```shell
# open a new window and connect to c3, in c3
$ ssh c3@c3edu.online
$ ssh -f -N mario@192.168.1.1 -R 2210:localhost:389
# or use one line
$ ssh -t c3@c3edu.online "ssh -f -N mario@192.168.1.1 -R 2210:localhost:389"
```

### Change .env to use tunnel

```shell
# ldap
# LDAP_URL="127.0.0.1"
# ldap using tunnel
LDAP_URL="192.168.1.1:2210"
```

### Debug package and consumer App

```shell
# package watch: in term1: build and watch
$ cd nestjs-package-jwt-authentication-ldap
$ npm run start:dev

# consumer app (api)
# now press f5 to debug consumer app (without launch npm run start:dev)
# after changes in package, restart debugger with ctrl+shift+f5
# wait for...in debug console
[NestApplication] Nest application successfully started +2ms
```

> to debug use `launch.json` with [F5]

> if service not start check `DEBUG CONSOLE` window for errors

> UPDATE: 2020-11-30 11:52:50: Fixed `launch.json` now it works with sourceMaps and watch, just launch F5 and Done!

> NOTE: in any change restart debugger with `ctrl+shift+F5` and warn always `npm run build` to reflect changes, like when we change server port, and other consumer stuff, because when we are in debug we aren't watch and build changes

> to watch and build for changes when debug use `npm run start:dev` in **consumer app**

### Test Api

```shell
$ curl --request POST \
  --url http://localhost:3000/auth/login \
  --header 'content-type: application/json' \
  --data '{"username": "mario","password": "root"}'
```

## Read base Starter Notes

- [Read Notes](https://github.com/koakh/NestJsPackageStarter/blob/main/NOTES.md)

## LDAP

```shell
# in local machine connect to tunnel
$ ldapsearch -H ldap://192.168.1.1:2210 -x -D "cn=administrator,cn=users,dc=c3edu,dc=online" -w "Root123..." -b ou=passport-ldapauth "(uid=mario)"
# in c3
$ ldapsearch -H ldap://localhost:389 -x -D "cn=administrator,cn=users,dc=c3edu,dc=online" -w "Root123..." -b ou=passport-ldapauth "(uid=mario)"
# test user auth in shell
$ /usr/lib/squid/basic_ldap_auth -h 127.0.0.1 -D cn=administrator,cn=users,dc=c3edu,dc=online -W /etc/ldap.password -s sub -b dc=c3edu,dc=online -f '(samaccountname=%s)'
# now type user and pass
mario root
OK

# right way to use searchFilter
$ curl -X POST http://localhost:3000/ldap -d '{"username": "mario", "password": "root"}' -H "Content-Type: application/json"
{"dn":"CN=mario,CN=Users,DC=c3edu,DC=online","controls":[]}
```

## Use LdapJs

- [LdapJs Docs](http://ldapjs.org/)

```shell
$ cd nestjs-package-jwt-authentication-ldap
$ npm i ldapjs
$ npm i -D @types/ldapjs
```

## Example of Search Users with LdapJs

- [simple example to search for username · Issue #428 · ldapjs/node-ldapjs · GitHub](https://github.com/ldapjs/node-ldapjs/issues/428)

> Note for `scope`, the trick to filter in c3 is using `scope: "sub`

```typescript
this.ldapClient.search(this.searchBase, { attributes: this.searchAttributes, scope: 'sub', filter: '(cn=mario)' }, (err, res) => {
  if (err) Logger.log(err);
  res.on('searchEntry', (entry) => {
    Logger.log('entry: ' + JSON.stringify(entry.object, undefined, 2), LdapService.name);
  });
  ...
```

## Problems

start debug

```shell
Debugger attached.
Waiting for the debugger to disconnect...
/media/mario/storage/Home/Documents/Development/Node/@NestJsPackages/TypescriptNestJsPackageJwtAuthenticationLdap/nestjs-package-jwt-authentication-ldap-consumer/src/main.ts:1
import { ValidationPipe } from '@nestjs/common';
```

seems that is a port conflit, resolve the issue, build and test, before launch debugger

```shell
$ npm run dev
[Nest] 3700   - 11/30/2020, 10:55:03 AM   [Main] server started at https://localhost:3010 +1ms
# require build to use new port 3001
$ npm run build
```

## Ignore debug error message

when launch debug with F5 we can see bellow error on start, please ignore it, eveything works has expected, move on

```shell
Could not read source map for file:///media/mario/storage/Home/Documents/Development/Node/@NestJsPackages/TypescriptNestJsPackageJwtAuthenticationLdap/nestjs-package-jwt-authentication-ldap-consumer/node_modules/typescript/lib/typescript.js: ENOENT: no such file or directory, open '/media/mario/storage/Home/Documents/Development/Node/@NestJsPackages/TypescriptNestJsPackageJwtAuthenticationLdap/nestjs-package-jwt-authentication-ldap-consumer/node_modules/typescript/lib/typescript.js.map'
```

## Missing LDAP Port Forword

```shell
[ExceptionsHandler] connect ECONNREFUSED 192.168.1.1:2210 +97867ms
Error: connect ECONNREFUSED 192.168.1.1:2210
```

## Extract data from JWT in Endpoints, ex Extract injected User

- [Get current user in nestjs on a route without an AuthGuard](https://stackoverflow.com/questions/63257879/get-current-user-in-nestjs-on-a-route-without-an-authguard)

just extract `user` from request

```typescript
@Post('/user')
@UseGuards(JwtAuthGuard)
async createUserRecord(
  @Request() req,
  @Response() res,
  @Body() createLdapUserDto: CreateUserRecordDto,
): Promise<void> {
  console.log(req.user); 
```

the magic happens in `nestjs-package-jwt-authentication-ldap/src/auth/strategy/ldap.strategy.ts` where we inject user in request in `req.user = user;`

```typescript
@Injectable()
export class LdapStrategy extends PassportStrategy(Strategy, 'ldap') {
  constructor(private readonly configService: ConfigService) {
    super({
      // allows us to pass back the entire request to the callback
      passReqToCallback: true,
      server: {
        // ldapOptions
        url: `ldap://${configService.get(envConstants.LDAP_URL)}`,
        bindDN: configService.get(envConstants.LDAP_BIND_DN),
        bindCredentials: configService.get(envConstants.LDAP_BIND_CREDENTIALS),
        searchBase: configService.get(envConstants.LDAP_SEARCH_BASE),
        searchFilter: configService.get(envConstants.LDAP_SEARCH_FILTER),
        searchAttributes: configService.get(envConstants.LDAP_SEARCH_ATTRIBUTES).toString().split(','),
      },
    }, async (req: Request, user: any, done) => {
      // add user to request
      req.user = user;
      return done(null, user);
    });
  }
}
```

## Add AuthRoles Guard, Decorator etc

- [Documentation | NestJS - A progressive Node.js framework](https://docs.nestjs.com/guards#role-based-authentication)

add files

- `nestjs-package-jwt-authentication-ldap/src/auth/decorators/roles.decorator.ts`
- `nestjs-package-jwt-authentication-ldap/src/auth/enums/roles.enum.ts`
- `nestjs-package-jwt-authentication-ldap/src/auth/strategy/role.strategy.ts`
- `nestjs-package-jwt-authentication-ldap/src/auth/guards/role-auth.guard.ts`
- `nestjs-package-jwt-authentication-ldap/src/auth/auth.module.ts`

```typescript
import { JwtStrategy, LdapStrategy,RoleStrategy } from './strategy';
...
@Module({
  ...
  providers: [
    AuthService, JwtStrategy, LdapStrategy, RoleStrategy, LdapService,
  ],
})
```

use guards like that

```typescript
constructor(private readonly ldapService: LdapService) { }
@Post('/user')
@Roles(UserRoles.C3_ADMINISTRATOR)
@UseGuards(RolesAuthGuard)
@UseGuards(JwtAuthGuard)
async createUserRecord(
  @Request() req,
  @Response() res,
  @Body() createLdapUserDto: CreateUserRecordDto,
): Promise<void> {
```

## ldapjs Password Change

- [ldapjs Password Change](https://gist.github.com/mattwoolnough/4ab72ad0d00b9f3067bb55835bda1566)

```typescript
Client.modify(userDN, [
  new ldap.Change({
    operation: 'delete',
    modification: {
      unicodePwd: encodePassword(oldPassword)
    }
  }),
  new ldap.Change({
    operation: 'add',
    modification: {
      unicodePwd: encodePassword(newPassword)
    }
  })
```

> When sending **add** and **delete** at the same time **Active Directory** treats it as a **normal password reset**, to perform an **administrator password reset** Active Directory only expects to receive the **replace** command.

## Install anc Configure OpenApi on consumer App and package

- [Documentation | NestJS - A progressive Node.js framework](https://docs.nestjs.com/openapi/introduction)
- [Sample Project](/media/mario/storage/Home/Documents/Development/Node/@NestJs/NodeNestJsSwaggerSample)

### Installation

```shell
$ cd nestjs-package-jwt-authentication-ldap-consumer/
$ npm install --save @nestjs/swagger swagger-ui-express
```

### Bootstrap

Once the installation process is complete, open the main.ts file and initialize Swagger using the SwaggerModule class:

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
```

> done run app and go to <http://localhost:3010/api/>

> To generate and download a Swagger JSON file, navigate to <http://localhost:3010/api-json> (swagger-ui-express)

### Add @ApiProperty() to schemas

```shell
# add @nestjs/swagger to package to use `@ApiProperty()`
$ cd nestjs-package-jwt-authentication-ldap
$ npm install --save @nestjs/swagger
```

get schemas, add `@ApiProperty()`

- CreateUserRecordDto
- AddDeleteUserToGroupDto
- SearchUserRecordsDto
- ChangeUserPasswordDto

> HINT: **Instead of manually annotating each property**, consider using the **Swagger plugin** (see [Plugin section](https://docs.nestjs.com/openapi/cli-plugin)) which will automatically provide this for you

> Please, note that your filenames must have one of the following suffixes: `['.dto.ts', '.entity.ts']` (e.g., create-user.dto.ts) in order to be analysed by the plugin

- [Using the CLI plugin](https://docs.nestjs.com/openapi/cli-plugin#using-the-cli-plugin)

To enable the plugin, open `nest-cli.json` (if you use Nest CLI) and add the following plugins configuration:


add `compilerOptions` to `nest-cli.json`

```json
{
  "language": "ts",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": ["@nestjs/swagger"]
  }  
}
```





npm i -D @nestjs/cli @nestjs/schematics


https://trilon.io/blog/eliminating-redundancy-with-nestjs-cli-plugins
To enable plugins, open up the nest-cli.json file (if you use Nest CLI) and add the following plugins configuration:
IF YOU USE CLI
we use 
    "start": "ts-node -r tsconfig-paths/register src/main.ts",
    "start:dev": "nodemon",
    "start:debug": "nodemon --config nodemon-debug.json",
and not
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",



fuck after we use `nest start` all local task endpoints start working and dtos to
only non consumer app don't work

- CreateUserRecordDto
- AddDeleteUserToGroupDto
- SearchUserRecordsDto
- ChangeUserPasswordDto


the trick to make appear Auth Dto's on swagger is usign the missing attribute `@Body` in `@Request` :(

```typescript
@Controller('auth')
@ApiTags('auth')
export class AuthController {
  ...
  @Post('/login')
  @UseGuards(LdapAuthGuard)
  @ApiBody({ type: LoginDto })
  // require @ApiBody else LoginDto is not exposed in swagger api
  async login(
    @Request() req: LoginDto,
    // TODO add LoginResponseDto 
    @Response() res,
  ): Promise<LoginResponseDto> {
    // authenticate user
    passport.authenticate('ldap', { session: false });
```


@ApiParam({name: 'operation', enum: ['replace', 'add', 'delete']})


- [Documentation | NestJS - A progressive Node.js framework](https://docs.nestjs.com/openapi/types-and-parameters#generics-and-interfaces)

BUT IF WE USE @Body we can't login :(
to solve use `@ApiBody({ type: [LoginDto] })`

- [NestJS, Modules and Swagger best practices](https://cimpleo.com/blog/nestjs-modules-and-swagger-best-practices/)



