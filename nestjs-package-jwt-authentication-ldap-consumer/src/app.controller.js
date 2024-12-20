"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
let AppController = (() => {
    let _classDecorators = [(0, common_1.Controller)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _testAppServiceGetWelcome_decorators;
    let _testConsumerAppServiceGetWelcome_decorators;
    let _testAuthServiceHashPassword_decorators;
    let _testLdapServiceGetUserRecord_decorators;
    let _testConfigService_decorators;
    var AppController = _classThis = class {
        constructor(
        // test local providers
        appService, 
        // test package providers
        authService, ldapService, config, consumerAppService) {
            this.appService = (__runInitializers(this, _instanceExtraInitializers), appService);
            this.authService = authService;
            this.ldapService = ldapService;
            this.config = config;
            this.consumerAppService = consumerAppService;
        }
        async testAppServiceGetWelcome(username) {
            return { message: this.appService.getWelcome(username) };
        }
        async testConsumerAppServiceGetWelcome(username) {
            return { message: this.consumerAppService.getWelcome(username) };
        }
        // @Get('consumer/inject-metadata/:username')
        // async testConsumerAppServiceInjectMetadata(
        //   @Param('username') username: string,
        // ) {
        //   return { message: this.consumerAppService.injectMetadataCache(username) };
        // }
        async testAuthServiceHashPassword({ password }) {
            return { message: this.authService.hashPassword(password) };
        }
        async testLdapServiceGetUserRecord(username) {
            return await this.ldapService.getUserRecord(username);
        }
        async testConfigService(section) {
            return await this.config[section];
        }
    };
    __setFunctionName(_classThis, "AppController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _testAppServiceGetWelcome_decorators = [(0, common_1.Get)('app/:username'), openapi.ApiResponse({ status: 200 })];
        _testConsumerAppServiceGetWelcome_decorators = [(0, common_1.Get)('consumer/:username'), openapi.ApiResponse({ status: 200 })];
        _testAuthServiceHashPassword_decorators = [(0, common_1.Post)('hash-password'), openapi.ApiResponse({ status: 201 })];
        _testLdapServiceGetUserRecord_decorators = [(0, common_1.Get)('user/:username'), openapi.ApiResponse({ status: 200, type: require("../../nestjs-package-jwt-authentication-ldap/dist/auth/ldap/dto/search-user-record-response.dto").SearchUserRecordResponseDto })];
        _testConfigService_decorators = [(0, common_1.Get)('config/:section'), openapi.ApiResponse({ status: 200, type: Object })];
        __esDecorate(_classThis, null, _testAppServiceGetWelcome_decorators, { kind: "method", name: "testAppServiceGetWelcome", static: false, private: false, access: { has: obj => "testAppServiceGetWelcome" in obj, get: obj => obj.testAppServiceGetWelcome }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _testConsumerAppServiceGetWelcome_decorators, { kind: "method", name: "testConsumerAppServiceGetWelcome", static: false, private: false, access: { has: obj => "testConsumerAppServiceGetWelcome" in obj, get: obj => obj.testConsumerAppServiceGetWelcome }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _testAuthServiceHashPassword_decorators, { kind: "method", name: "testAuthServiceHashPassword", static: false, private: false, access: { has: obj => "testAuthServiceHashPassword" in obj, get: obj => obj.testAuthServiceHashPassword }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _testLdapServiceGetUserRecord_decorators, { kind: "method", name: "testLdapServiceGetUserRecord", static: false, private: false, access: { has: obj => "testLdapServiceGetUserRecord" in obj, get: obj => obj.testLdapServiceGetUserRecord }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _testConfigService_decorators, { kind: "method", name: "testConfigService", static: false, private: false, access: { has: obj => "testConfigService" in obj, get: obj => obj.testConfigService }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AppController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AppController = _classThis;
})();
exports.AppController = AppController;
;
