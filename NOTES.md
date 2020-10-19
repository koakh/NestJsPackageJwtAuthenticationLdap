# NOTES

- [NOTES](#notes)
  - [Starter Project](#starter-project)
    - [Links](#links)
    - [TLDR](#tldr)
  - [Create tunnel to connect to c3 LDAP](#create-tunnel-to-connect-to-c3-ldap)
    - [Read base Starter Notes](#read-base-starter-notes)
  - [LDAP](#ldap)

## Starter Project

### Links

- [Publishing NestJS Packages with npm](https://dev.to/nestjs/publishing-nestjs-packages-with-npm-21fm)
- [nestjsplus/nestjs-package-starter](https://github.com/nestjsplus/nestjs-package-starter)
- [Koakh/NestJsPackageStarter](https://github.com/koakh/NestJsPackageStarter)
- [GitHub: NestJsPackageJwtAuthentication](https://github.com/koakh/NestJsPackageJwtAuthentication)
- [NPM: NestJsPackageJwtAuthentication](https://www.npmjs.com/package/@koakh/nestjs-package-jwt-authentication-ldap)

### TLDR

used node version `node/v12.8.1`

> this notes are the continuation of NOTES.md from [NestJsPackageStarter](https://github.com/koakh/NestJsPackageStarter/blob/main/NOTES.md) and [GitHub: NestJsPackageJwtAuthentication](https://github.com/koakh/NestJsPackageJwtAuthentication)

to debug use `launch.json` with [F5]

## Create tunnel to connect to c3 LDAP

```shell
# in c3
$ ssh -f -N mario@192.168.1.1 -R 2210:localhost:389
```

### Read base Starter Notes

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
