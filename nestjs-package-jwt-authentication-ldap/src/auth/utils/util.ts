import * as bcrypt from 'bcrypt';

const bcryptSaltRounds: number = 10;

/**
 * // TODO: can be removed, is not used in ldap
 * old bcrypt hashPassword
 * @param password 
 */
export const hashPassword = (password: string): string => {
  if (!password) {
    throw new Error(`invalid password '${password}'`);
  }
  return bcrypt.hashSync(password, bcryptSaltRounds);
};

/**
 * simple template parser
 * @param stringTemplate
 * @param obj
 */
export const parseTemplate = (stringTemplate: string, obj: any) => stringTemplate.replace(/\${(.*?)}/g, (x, g) => obj[g]);

/**
 * encode ldapPassword
 * @param utf8
 */
export const encodeAdPassword = (utf8) => {
  // const quoteEncoded = '"' + '\000';
  // const quoteEncoded = '"' + '\\000';
  const quoteEncoded = '"' + '\u0000';
  let utf16le = quoteEncoded;
  // eslint-disable-next-line no-plusplus
  for (let i = 0, n = utf8.length; i < n; ++i) {
    // utf16le += utf8[i] + '\\000';
    utf16le += utf8[i] + '\u0000';
  }
  utf16le += quoteEncoded;

  return utf16le;
}




// const pwd = {
//   encodeAdPassword(utf8) {
//     const quoteEncoded = '"' + '\\000'>;

//     let utf16le = quoteEncoded;
//     // eslint-disable-next-line no-plusplus
//     for (let i = 0, n = utf8.length; i < n; ++i) {
//       utf16le += utf8[i] + '\000';
//     }
//     utf16le += quoteEncoded;

//     return utf16le;
//   },
//   escapeSystemPassword(unescaped) {
//     return unescaped.replace(/'/g, "'\"'\"'");
//   }
// };