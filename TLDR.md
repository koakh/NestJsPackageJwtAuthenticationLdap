# TLDR

## Checkout Project

```shell
$ cd /tmp
$ git clone https://github.com/koakh/NestJsPackageJwtAuthenticationLdap.git
$ cd NestJsPackageJwtAuthenticationLdap
```

## Consumer App

```shell
# package
$ cd nestjs-package-jwt-authentication-ldap
$ npm i
$ npm run build
# npm run dev

# consumer app
$ cd nestjs-package-jwt-authentication-ldap-consumer
$ npm i
# check package symbolic link, to work with debug
$ ls -la node_modules/@koakh
lrwxrwxrwx   1 c3 c3    47 May  2 23:29 nestjs-package-jwt-authentication-ldap -> ../../../nestjs-package-jwt-authentication-ldap

# debug
$ npm run start:debug
```

add a breakpoint and launch debuger, tested with above notes and everything works out of the box

> NOTE: in package changes, we must stop and start consumer, it will not reload after packages changes

## C3-Backend: WIP (doesn't work, opted to use consumer app)

```shell
$ cd ~/c3-backend/node_modules/@koakh
$ rm nestjs-package-jwt-authentication-ldap -R
$ ln -s ../../../NestJsPackageJwtAuthenticationLdap/nestjs-package-jwt-authentication-ldap

# double check
$ ls -la
lrwxrwxrwx   1 c3 c3    82 May  2 18:40 nestjs-package-jwt-authentication-ldap -> ../../../NestJsPackageJwtAuthenticationLdap/nestjs-package-jwt-authentication-ldap
# double check
$ cd ~/c3-backend
$ ls -la node_modules/@koakh
lrwxrwxrwx   1 c3 c3    82 May  2 18:40 nestjs-package-jwt-authentication-ldap -> ../../../NestJsPackageJwtAuthenticationLdap/nestjs-package-jwt-authentication-ldap

# open debug file in c3-backend code
$ code ~/NestJsPackageJwtAuthenticationLdap/nestjs-package-jwt-authentication-ldap/src/auth/ldap/ldap.service.ts
```


