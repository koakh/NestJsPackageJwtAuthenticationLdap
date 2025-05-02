# TLDR

## Consumer App

```shell
$ ls -la nestjs-package-jwt-authentication-ldap-consumer/node_modules/@koakh
total 24
drwxrwxr-x   2 c3 c3  4096 May  2 18:36 .
drwxrwxr-x 427 c3 c3 20480 May  2 18:01 ..
lrwxrwxrwx   1 c3 c3    47 May  2 17:53 nestjs-package-jwt-authentication-ldap -> ../../../nestjs-package-jwt-authentication-ldap
```

## C3-Backend

```shell
$ cd ~/c3-backend/node_modules/@koakh
$ ln -s ../../../NestJsPackageJwtAuthenticationLdap/nestjs-package-jwt-authentication-ldap

# double check
$ ls -la
total 32
drwxrwxr-x   3 c3 c3  4096 May  2 18:40 .
drwxrwxr-x 571 c3 c3 20480 Apr 23 00:11 ..
lrwxrwxrwx   1 c3 c3    82 May  2 18:40 nestjs-package-jwt-authentication-ldap -> ../../../NestJsPackageJwtAuthenticationLdap/nestjs-package-jwt-authentication-ldap
# double check
$ cd ~/c3-Backend
$ ls -la node_modules/@koakh
total 32
drwxrwxr-x   3 c3 c3  4096 May  2 18:40 .
drwxrwxr-x 571 c3 c3 20480 Apr 23 00:11 ..
lrwxrwxrwx   1 c3 c3    82 May  2 18:40 nestjs-package-jwt-authentication-ldap -> ../../../NestJsPackageJwtAuthenticationLdap/nestjs-package-jwt-authentication-ldap
```
