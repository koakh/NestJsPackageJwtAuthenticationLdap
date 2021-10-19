i  package remove perr dependencies, else cant find @nestjs/common

"dependencies": {
  "@nestjs/common": "^8.0.4",
  "reflect-metadata": "^0.1.13",
  "@nestjs/core": "^8.0.4",

rm node_modules/ package-lock.json -R | true && npm i

in consumer

rm node_modules/ package-lock.json -R | true && npm i
npm run start:dev

Potential solutions:
- If Reflector is a provider, is it part of the current AuthModule?
- If Reflector is exported from a separate @Module, is that module imported within AuthModule?
  @Module({
    imports: [ /* the Module containing Reflector */ ]
  })


  https://stackoverflow.com/questions/35207380/how-to-install-npm-peer-dependencies-automatically
  I experienced these errors when I was developing an npm package that had peerDependencies.
  I had to ensure that any peerDependencies were also listed as devDependencies.
  The project would not automatically use the globally installed packages.



c3 backed chekout
npm i only on root
and it works


npm i node_modules_local/nestjs-package-jwt-authentication-ldap/
No repository field.
npm WARN The package @nestjs/core is included as both a dev and production dependency.
removed from dev

npm WARN @golevelup/nestjs-modules@0.4.3 requires a peer of @nestjs/common@^7.x but none is installed. You must install peer dependencies yourself.

npm i node_modules_local/nestjs-package-jwt-authentication-ldap/ 
use --legacy-peer-deps
npm i node_modules_local/nestjs-package-jwt-authentication-ldap/ --legacy-peer-deps



trick to solve this problem in 

is start using "@koakh/nestjs-package-jwt-authentication-ldap": "^1.0.21",
after project consumer app runs without issues

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