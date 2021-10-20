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



