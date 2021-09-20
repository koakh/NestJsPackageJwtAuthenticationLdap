"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
function createModuleConfigProvider(provide, options) {
    if (options.useFactory) {
        return [
            {
                provide,
                useFactory: options.useFactory,
                inject: options.inject || [],
            },
        ];
    }
    const optionsProvider = {
        provide,
        useFactory: async (moduleConfigFactory) => {
            return moduleConfigFactory.createModuleConfig();
        },
        inject: [
            options.useClass ||
                lodash_1.get(options, 'useExisting.provide', options.useExisting.value.constructor.name),
        ],
    };
    if (options.useClass) {
        return [
            optionsProvider,
            {
                provide: options.useClass,
                useClass: options.useClass,
            },
        ];
    }
    if (options.useExisting) {
        return [
            optionsProvider,
            {
                provide: options.useExisting.provide ||
                    options.useExisting.value.constructor.name,
                useValue: options.useExisting.value,
            },
        ];
    }
    return [];
}
exports.createModuleConfigProvider = createModuleConfigProvider;
function createConfigurableDynamicRootModule(moduleConfigToken, moduleProperties = {
    imports: [],
    exports: [],
    providers: [],
}) {
    class DynamicRootModule {
        static forRootAsync(moduleCtor, asyncModuleConfig) {
            const dynamicModule = {
                module: moduleCtor,
                imports: [
                    ...(asyncModuleConfig.imports || []),
                    ...(moduleProperties.imports || []),
                ],
                exports: [
                    ...(asyncModuleConfig.exports || []),
                    ...(moduleProperties.exports || []),
                ],
                providers: [
                    ...createModuleConfigProvider(moduleConfigToken, asyncModuleConfig),
                    ...(moduleProperties.providers || []),
                ],
            };
            DynamicRootModule.moduleSubject.next(dynamicModule);
            return dynamicModule;
        }
        static forRoot(moduleCtor, moduleConfig) {
            const dynamicModule = {
                module: moduleCtor,
                imports: [...(moduleProperties.imports || [])],
                exports: [...(moduleProperties.exports || [])],
                controllers: [...(moduleProperties.controllers || [])],
                providers: [
                    {
                        provide: moduleConfigToken,
                        useValue: moduleConfig,
                    },
                    ...(moduleProperties.providers || []),
                ],
            };
            DynamicRootModule.moduleSubject.next(dynamicModule);
            return dynamicModule;
        }
        static async externallyConfigured(moduleCtor, wait) {
            const timeout$ = rxjs_1.interval(wait).pipe(operators_1.first(), operators_1.map(() => {
                throw new Error(`Expected ${moduleCtor.name} to be configured by at last one Module but it was not configured within ${wait}ms`);
            }));
            return rxjs_1.race(timeout$, DynamicRootModule.moduleSubject.pipe(operators_1.first())).toPromise();
        }
    }
    DynamicRootModule.moduleSubject = new rxjs_1.Subject();
    return DynamicRootModule;
}
exports.createConfigurableDynamicRootModule = createConfigurableDynamicRootModule;
//# sourceMappingURL=dynamicModules.js.map