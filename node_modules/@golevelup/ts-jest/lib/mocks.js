"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createRecursiveMockProxy = (name) => {
    const cache = new Map();
    const proxy = new Proxy({}, {
        get: (obj, prop) => {
            const propName = prop.toString();
            if (cache.has(prop)) {
                return cache.get(prop);
            }
            const checkProp = obj[prop];
            const mockedProp = prop in obj
                ? typeof checkProp === 'function'
                    ? jest.fn()
                    : checkProp
                : propName === 'then'
                    ? undefined
                    : createRecursiveMockProxy(propName);
            cache.set(prop, mockedProp);
            return mockedProp;
        },
    });
    return jest.fn(() => proxy);
};
exports.createMock = (partial = {}, options = {}) => {
    const cache = new Map();
    const { name = 'mock' } = options;
    const proxy = new Proxy(partial, {
        get: (obj, prop) => {
            if (prop === 'constructor' ||
                prop === 'inspect' ||
                prop === 'then' ||
                (typeof prop === 'symbol' &&
                    prop.toString() === 'Symbol(util.inspect.custom)')) {
                return undefined;
            }
            if (cache.has(prop)) {
                return cache.get(prop);
            }
            const checkProp = obj[prop];
            const mockedProp = prop in obj
                ? typeof checkProp === 'function'
                    ? jest.fn(checkProp)
                    : checkProp
                : createRecursiveMockProxy(`${name}.${prop.toString()}`);
            cache.set(prop, mockedProp);
            return mockedProp;
        },
    });
    return proxy;
};
//# sourceMappingURL=mocks.js.map