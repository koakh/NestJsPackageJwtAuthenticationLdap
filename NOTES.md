# NOTES

- [NOTES](#notes)
  - [Starter Project](#starter-project)
    - [Links](#links)
  - [TLDR](#tldr)
    - [Create tunnel to connect to c3 LDAP](#create-tunnel-to-connect-to-c3-ldap)
    - [Change .env to use tunnel](#change-env-to-use-tunnel)
    - [Debug package and consumer app](#debug-package-and-consumer-app)
    - [Test Api](#test-api)
  - [Read base Starter Notes](#read-base-starter-notes)
  - [LDAP](#ldap)
  - [Use LdapJs](#use-ldapjs)
  - [Example of Search Users with LdapJs](#example-of-search-users-with-ldapjs)

## Starter Project

### Links

- [Publishing NestJS Packages with npm](https://dev.to/nestjs/publishing-nestjs-packages-with-npm-21fm)
- [nestjsplus/nestjs-package-starter](https://github.com/nestjsplus/nestjs-package-starter)
- [Koakh/NestJsPackageStarter](https://github.com/koakh/NestJsPackageStarter)
- [GitHub: NestJsPackageJwtAuthentication](https://github.com/koakh/NestJsPackageJwtAuthentication)
- [NPM: NestJsPackageJwtAuthentication](https://www.npmjs.com/package/@koakh/nestjs-package-jwt-authentication-ldap)

## TLDR

used node version `node/v12.8.1`

> this notes are the continuation of NOTES.md from [NestJsPackageStarter](https://github.com/koakh/NestJsPackageStarter/blob/main/NOTES.md) and [GitHub: NestJsPackageJwtAuthentication](https://github.com/koakh/NestJsPackageJwtAuthentication)

### Create tunnel to connect to c3 LDAP

```shell
# open a new window and connect to c3, in c3
$ ssh c3@c3edu.online
$ ssh -f -N mario@192.168.1.1 -R 2210:localhost:389
```

### Change .env to use tunnel

```shell
# ldap
# LDAP_URL="127.0.0.1"
# ldap using tunnel
LDAP_URL="192.168.1.1:2210"
```

### Debug package and consumer app

```shell
# in term1: build and watch
$ cd nestjs-package-jwt-authentication-ldap
$ npm run start:dev
# now press f5 to debug consumer app (without launch npm run start:dev)
# after changes in package, restart debugger with ctrl+shift+f5
# wait for...in debug console
[NestApplication] Nest application successfully started +2ms
```

> to debug use `launch.json` with [F5]

> if service not start check `DEBUG CONSOLE` window for errors

> NOTE: in any change restart debugger with `ctrl+shift+F5` 

### Test Api

```shell
$ curl --request POST \
  --url http://localhost:3000/auth/login-ldap \
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
