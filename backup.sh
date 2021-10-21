#!/bin/bash

DT=$(date +%Y-%m-%d-%H-%M)
DIR=.bak
FILE="$DIR/$DT.tgz"
FILE_EXCLUDE=exclude.tag
mkdir $DIR -p
touch .bak/$FILE_EXCLUDE
# touch nestjs-package-jwt-authentication-ldap/node_modules/$FILE_EXCLUDE
# touch nestjs-package-jwt-authentication-ldap-consumer/node_modules/$FILE_EXCLUDE
touch nestjs-package-jwt-authentication-ldap-consumer/dist/$FILE_EXCLUDE

tar -czvf $FILE \
  --exclude-tag-all=exclude.tag \
  .
