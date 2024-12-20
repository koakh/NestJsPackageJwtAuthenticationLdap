"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomSecret = void 0;
/**
 * generate a random secret string
 * @param length
 * @returns
 */
const randomSecret = (length = 100) => {
    const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#%&~!@-#$';
    let retVal = '';
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
};
exports.randomSecret = randomSecret;
