"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const nestjs_package_jwt_authentication_ldap_1 = require("@koakh/nestjs-package-jwt-authentication-ldap");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const consumer_app_module_1 = require("./consumer-app/consumer-app.module");
const consumer_app_service_1 = require("./consumer-app/consumer-app.service");
let AppModule = (() => {
    let _classDecorators = [(0, common_1.Module)({
            imports: [
                // config module
                config_1.ConfigModule.forRoot({ isGlobal: true, }),
                // the trick is import the module, not the service here, this will expose AppController to
                // AuthModule,
                nestjs_package_jwt_authentication_ldap_1.AuthModule.forRootAsync(nestjs_package_jwt_authentication_ldap_1.AuthModule, {
                    imports: [config_1.ConfigModule, consumer_app_module_1.ConsumerAppModule],
                    inject: [config_1.ConfigService, consumer_app_service_1.ConsumerAppService],
                    useFactory: (config, consumerAppService) => {
                        return {
                            consumerAppService,
                            config: {
                                auth: {
                                    authShowAccessTokenProps: config.get('AUTH_SHOW_ACCESS_TOKEN_PROPS', false),
                                    authSecretKey: config.get('AUTH_SECRET_KEY', '4LGHe209gmlJtQwP7FfM89hMNzOCqrNg'),
                                    accessTokenJwtSecret: config.get('ACCESS_TOKEN_JWT_SECRET', () => consumerAppService.getJwtSecrets().accessTokenJwtSecret),
                                    refreshTokenJwtSecret: config.get('REFRESH_TOKEN_JWT_SECRET', () => consumerAppService.getJwtSecrets().refreshTokenJwtSecret),
                                    accessTokenExpiresIn: config.get('ACCESS_TOKEN_EXPIRES_IN', '30m'),
                                    refreshTokenExpiresIn: config.get('REFRESH_TOKEN_EXPIRES_IN', '7d'),
                                    refreshTokenSkipIncrementVersion: config.get('REFRESH_TOKEN_SKIP_INCREMENT_VERSION', false),
                                    roleAdmin: config.get('AUTH_ADMIN_ROLE', 'C3_ADMINISTRATOR'),
                                    rolePermittedUnlicensedPermissionGroups: config.get('AUTH_ADMIN_ROLE_PERMITTED_UNLICENSED_PERMISSION_GROUPS', 'RP_LICENSE,RP_INTERNET_ACCESS,RP_TIME_CONFIGURATION,RP_WIRELESS,RP_LOCAL_AREA_NETWORK'),
                                    developerGroup: config.get('DEVELOPER_GROUP', 'C3Developer'),
                                    developerAccessTokenExpiresIn: config.get('DEVELOPER_ACCESS_TOKEN_EXPIRES_IN', '1000y'),
                                },
                                ldap: {
                                    address: config.get('LDAP_ADDRESS', 'localhost'),
                                    port: config.get('LDAP_PORT', 389),
                                    usersBaseSearch: config.get('LDAP_USERS_BASE_SEARCH', ''),
                                    baseDN: config.get('LDAP_BASE_DN', 'dc=c3edu,dc=online'),
                                    baseAdmin: config.get('LDAP_BASE_ADMIN', 'cn=administrator,cn=users'),
                                    bindDN: config.get('LDAP_BIND_DN', 'cn=administrator,cn=users,dc=c3edu,dc=online'),
                                    rootUser: config.get('LDAP_ROOT_USER', 'c3'),
                                    bindCredentials: config.get('LDAP_BIND_CREDENTIALS', 'somesecretpassword'),
                                    searchBase: config.get('LDAP_SEARCH_BASE', 'ou=People,dc=c3edu,dc=online'),
                                    searchUserFilterStrategy: config.get('LDAP_SEARCH_USER_FILTER_STRATEGY', '(cn={{username}})'),
                                    searchUserFilter: config.get('LDAP_SEARCH_USER_FILTER', '(cn=${username})'),
                                    searchUserAttributes: config.get('LDAP_SEARCH_USER_ATTRIBUTES', 'cn,givenName,sn,displayName,userPrincipalName,memberOf,userAccountControl,objectCategory,distinguishedName,mail,lastLogonTimestamp,gender,c3UserRole,dateOfBirth,studentID,telephoneNumber,extraPermission'),
                                    searchGroupFilter: config.get('LDAP_SEARCH_GROUP_FILTER', '(cn=${groupName})'),
                                    searchGroupAttributes: config.get('LDAP_SEARCH_GROUP_ATTRIBUTES', 'dn,cn,name,memberOf,objectCategory,distinguishedName,permission'),
                                    searchGroupProfilesPrefix: config.get('LDAP_SEARCH_GROUP_PROFILES_PREFIX', 'C3'),
                                    searchGroupPermissionsPrefix: config.get('LDAP_SEARCH_GROUP_PERMISSIONS_PREFIX', 'RP'),
                                    searchGroupExcludeProfileGroups: config.get('LDAP_SEARCH_GROUP_EXCLUDE_PROFILE_GROUPS', 'C3Developer'),
                                    searchGroupExcludePermissionGroups: config.get('LDAP_SEARCH_GROUP_EXCLUDE_PERMISSION_GROUPS', ''),
                                    searchCacheFilter: config.get('LDAP_SEARCH_CACHE_FILTER', '(objectCategory=CN=Person,CN=Schema,CN=Configuration,DC=c3edu,DC=online)'),
                                    newUserDnPostfix: config.get('LDAP_NEW_USER_DN_POSTFIX', 'ou=People'),
                                }
                            }
                        };
                    },
                }),
            ],
            // WARN: required to enable AppController, AppService and ConsumerAppService to use consumer app endpoints in AppController
            // enable AppController controller only to test it in package development, in publish package this must be disabled
            controllers: [ /*AppController*/],
            // require to use app AppService in DI
            // else Nest can't resolve dependencies of the AppController (?). Please make sure that the argument AppService at index [0] is available in the AppModule context
            providers: [ /*AppService, ConsumerAppService*/],
            exports: []
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AppModule = _classThis = class {
    };
    __setFunctionName(_classThis, "AppModule");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AppModule = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AppModule = _classThis;
})();
exports.AppModule = AppModule;
