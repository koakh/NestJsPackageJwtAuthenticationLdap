#!/bin/bash

# Navigate to the project root
cd /home/c3/c3-backend-upgrade-projects/NestJsPackageJwtAuthenticationLdap

# Clean npm cache
npm cache clean --force

# Remove all node_modules
rm -rf nestjs-package-jwt-authentication-ldap/node_modules
rm -rf nestjs-package-jwt-authentication-ldap-consumer/node_modules

# Reinstall dependencies in the package
cd nestjs-package-jwt-authentication-ldap
npm install

# Update package to ensure consistent types
npm run build

# Install dependencies in consumer app
cd ../nestjs-package-jwt-authentication-ldap-consumer
npm install

# Ensure peer dependencies are installed
npx npm-install-peers

# Rebuild the project
npm run build