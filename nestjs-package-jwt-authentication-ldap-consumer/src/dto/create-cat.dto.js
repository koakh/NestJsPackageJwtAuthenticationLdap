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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCatDto = void 0;
const openapi = require("@nestjs/swagger");
const decorators_1 = require("@nestjs/swagger/dist/decorators");
let CreateCatDto = (() => {
    var _a;
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _age_decorators;
    let _age_initializers = [];
    let _age_extraInitializers = [];
    let _breed_decorators;
    let _breed_initializers = [];
    let _breed_extraInitializers = [];
    let _roles_decorators;
    let _roles_initializers = [];
    let _roles_extraInitializers = [];
    return _a = class CreateCatDto {
            static _OPENAPI_METADATA_FACTORY() {
                return { name: { required: true, type: () => String }, age: { required: true, type: () => Number }, breed: { required: true, type: () => String }, roles: { required: true, type: () => [String] } };
            }
            constructor() {
                this.name = __runInitializers(this, _name_initializers, void 0);
                this.age = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _age_initializers, void 0));
                this.breed = (__runInitializers(this, _age_extraInitializers), __runInitializers(this, _breed_initializers, void 0));
                /**
                 * A list of user's roles
                 * @example ['admin']
                 */
                this.roles = (__runInitializers(this, _breed_extraInitializers), __runInitializers(this, _roles_initializers, void 0));
                __runInitializers(this, _roles_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _name_decorators = [(0, decorators_1.ApiProperty)({ default: 'Fritz' })];
            _age_decorators = [(0, decorators_1.ApiProperty)({ default: 28 })];
            _breed_decorators = [(0, decorators_1.ApiProperty)({ default: 'Abyssinian Cat' })];
            _roles_decorators = [(0, decorators_1.ApiProperty)({
                    description: `A list of user's roles`,
                    example: ['admin'],
                })];
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _age_decorators, { kind: "field", name: "age", static: false, private: false, access: { has: obj => "age" in obj, get: obj => obj.age, set: (obj, value) => { obj.age = value; } }, metadata: _metadata }, _age_initializers, _age_extraInitializers);
            __esDecorate(null, null, _breed_decorators, { kind: "field", name: "breed", static: false, private: false, access: { has: obj => "breed" in obj, get: obj => obj.breed, set: (obj, value) => { obj.breed = value; } }, metadata: _metadata }, _breed_initializers, _breed_extraInitializers);
            __esDecorate(null, null, _roles_decorators, { kind: "field", name: "roles", static: false, private: false, access: { has: obj => "roles" in obj, get: obj => obj.roles, set: (obj, value) => { obj.roles = value; } }, metadata: _metadata }, _roles_initializers, _roles_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.CreateCatDto = CreateCatDto;
