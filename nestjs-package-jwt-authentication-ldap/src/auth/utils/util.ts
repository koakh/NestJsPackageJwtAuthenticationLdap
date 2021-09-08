import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const bcryptSaltRounds: number = 10;

/**
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
 * @param stringTemplate ex (cn=${groupName})
 * @param obj pass a object ex { groupName }
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

/**
 * helper to filter valid groups
 * @param group current group to act on
 * @param ldapSearchGroupPrefix ex `C3` or empty `` for (all)
 * @param ldapSearchGroupExcludeGroups `C3Development,C3Administrator` or empty `` for (all)
 */
export const includeLdapGroup = (group: string, groupPrefix: string, groupExcludeGroups: string[], debug: boolean = false): boolean => {
  const excluded = groupExcludeGroups.length > 0 && groupExcludeGroups.findIndex(e => e === group) >= 0;
  if (excluded && debug) {
    Logger.log(`includeLdapGroup excluded group :${group}`, 'Util');
  }
  return (group.startsWith(groupPrefix) && !excluded);
}


