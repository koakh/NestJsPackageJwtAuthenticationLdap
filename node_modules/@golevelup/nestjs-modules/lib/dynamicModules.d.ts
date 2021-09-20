import { DynamicModule, Provider, Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { Subject } from 'rxjs';
declare type InjectionToken = string | symbol | Type<any>;
export interface ModuleConfigFactory<T> {
    createModuleConfig(): Promise<T> | T;
}
export interface AsyncModuleConfig<T> extends Pick<ModuleMetadata, 'imports' | 'exports'> {
    useExisting?: {
        value: ModuleConfigFactory<T>;
        provide?: InjectionToken;
    };
    useClass?: Type<ModuleConfigFactory<T>>;
    useFactory?: (...args: any[]) => Promise<T> | T;
    inject?: any[];
}
export declare function createModuleConfigProvider<T>(provide: InjectionToken, options: AsyncModuleConfig<T>): Provider[];
export interface IConfigurableDynamicRootModule<T, U> {
    new (): Type<T>;
    moduleSubject: Subject<DynamicModule>;
    forRoot(moduleCtor: Type<T>, moduleConfig: U): DynamicModule;
    forRootAsync(moduleCtor: Type<T>, asyncModuleConfig: AsyncModuleConfig<U>): DynamicModule;
    externallyConfigured(moduleCtor: Type<T>, wait: number): Promise<DynamicModule>;
}
export declare function createConfigurableDynamicRootModule<T, U>(moduleConfigToken: InjectionToken, moduleProperties?: Partial<Pick<ModuleMetadata, 'imports' | 'exports' | 'providers' | 'controllers'>>): IConfigurableDynamicRootModule<T, U>;
export {};
//# sourceMappingURL=dynamicModules.d.ts.map