# TLDR

## Checkout Project

```shell
$ cd /tmp
$ git clone https://github.com/koakh/NestJsPackageJwtAuthenticationLdap.git
$ cd NestJsPackageJwtAuthenticationLdap
```

## Package

```shell
# consumer detects changes here
$ npm run dev
# build package dev
$ npm run build
# build for backend use, WARN will broke the debug
$ npm run build:yalc
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
# check that package is symbolic link, to work with debug
$ ls -la node_modules/@koakh
lrwxrwxrwx   1 c3 c3    47 May  2 23:29 nestjs-package-jwt-authentication-ldap -> ../../../nestjs-package-jwt-authentication-ldap

# debug: NOTE: always use `start:debug` and not `start:debug:yalc` else yalc breaks the debug, see bellow notes
$ npm run start:debug
```

add a breakpoint and launch debuger, tested with above notes and everything works out of the box

> NOTE: in package changes, we must stop and start consumer, it will not reload after packages changes

### UnBreak Debug

in case of broken debug

```shell
WARN:  `npm run start:debug:yalc` (consumer) and `npm run build:yalc` (package) always replace symbolic link with yalc nestjs-package-jwt-authentication-ldap package
# KO
"@koakh/nestjs-package-jwt-authentication-ldap": "file:.yalc/@koakh/nestjs-package-jwt-authentication-ldap",
and this is waht breaks the debug
# OK
"@koakh/nestjs-package-jwt-authentication-ldap": "file:../nestjs-package-jwt-authentication-ldap",
```

> this occurs when we use `npm run build:yalc` to build the project to use in `c3-backend` for ex

fix it

```shell
$ cd nestjs-package-jwt-authentication-ldap-consumer
# if package is not a symbolic link, uninstall it and create the symbolic link
$ ls -la node_modules/@koakh
# remove yalc package
$ npm rm nestjs-package-jwt-authentication-ldap-consumer
$ rm node_modules/@koakh/nestjs-package-jwt-authentication-ldap
# install the package
$ npm i ../nestjs-package-jwt-authentication-ldap
# double check that package is symbolic link, to work with debug
$ ls -la node_modules/@koakh
lrwxrwxrwx   1 c3 c3    47 May 22 18:33 nestjs-package-jwt-authentication-ldap -> ../../../nestjs-package-jwt-authentication-ldap
# now test breakpoints with
$ npm run start:debug
```

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
