import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { pascalCase } from 'pascal-case';
import { SearchUserRecordDto } from '../ldap/dto';

const bcryptSaltRounds = 10;

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
export const encodeAdPassword = (utf8: string): string => {
  const quoteEncoded = '"' + '\u0000';
  let utf16le = quoteEncoded;
  // eslint-disable-next-line no-plusplus
  for (let i = 0, n = utf8.length; i < n; ++i) {
    // utf16le += utf8[i] + '\\000';
    // eslint-disable-next-line prefer-template
    utf16le += utf8[i] + '\u0000';
  }
  utf16le += quoteEncoded;

  return utf16le;
};

/**
 * encode ldapPassword in base64 format / unicodePwd
 * used to encode passwords and use it in iso file staticfiles/usr/share/samba/setup/c3/users.ldif
 * @param utf8
 */
export const encodeAdPasswordBase64 = (adPassword: string): string => {
  // 1234 = `IgAxADIAMwA0ACIA` in iso `unicodePwd:: IgAxADIAMwA0ACIA`
  // can use base64 decode to get original password
  return Buffer.from(encodeAdPassword(adPassword)).toString('base64');
};

/**
 * helper to filter valid groups
 * @param group current group to act on
 * @param ldapSearchGroupPrefix ex `C3` or empty `` for (all)
 * @param ldapSearchGroupExcludeGroups `C3Developer,C3Administrator` or empty `` for (all)
 */
export const includeLdapGroup = (group: string, groupPrefix: string, groupExcludeGroups: string[], debug = false): boolean => {
  const excluded = groupExcludeGroups.length > 0 && groupExcludeGroups.findIndex(e => e === group) >= 0;
  if (excluded && debug) {
    Logger.log(`includeLdapGroup excluded group :${group}`, 'Util');
  }
  return (group.startsWith(groupPrefix) && !excluded);
};

export const filterLdapGroup = (groups: SearchUserRecordDto[], groupExcludeGroups: string[], debug = false): SearchUserRecordDto[] => {
  // exclude user if it is in a excluded excludeProfileGroup
  const filteredExcludedGroups = [];
  groups.forEach((e) => {
    let excludeMember = false;
    if (debug) {
      Logger.log(`e: ${JSON.stringify(e)}`);
    };
    if (e.memberOf && Array.isArray(e.memberOf)) {
      e.memberOf.forEach((g: string) => {
        if (debug) {
          Logger.log(`group: ${g}`);
        };
        groupExcludeGroups.map(p => {
          if (g.toLowerCase().startsWith(`CN=${p}`.toLowerCase())) {
            if (debug) {
              Logger.log(`excludeMember: ${e.cn}`);
            }
            excludeMember = true;
          };
        })
      });
      if (!excludeMember) {
        filteredExcludedGroups.push(e);
      };
    }
  });
  return filteredExcludedGroups;
};

/**
 * get profile from user dn/defaultGroup, ASSUMES that 2 item is defaultGroup
 * @param dn ex "CN=c3,OU=C3Administrator,OU=People,DC=c3edu,DC=online"
 * @returns extracted profile output "C3Administrator"
 */
export const getProfileFromDistinguishedName = (dn: string): string => {
  try {
    const inputArray = dn.split(',');
    const inputArrayProfile = inputArray[1].split('=');
    const profile = inputArrayProfile[1];
    return profile;
  } catch (err) {
    return '';
  };
};

/**
 * get profile from memberOf
 * @param memberOf ex "CN=C3Teacher,OU=Profiles,OU=Groups,DC=c3edu,DC=online"
 * @returns extracted profile output "C3Teacher"
 */
 export const getProfileFromMemberOf = (memberOf: string): string => {
  try {
    const inputArray = memberOf.split(',');
    const inputArrayProfile = inputArray[0].split('=');
    const profile = inputArrayProfile[1];
    return profile;
  } catch (err) {
    return '';
  };
};

/*
* get profile from memberOf
* @param memberOf ex "cn=vini,ou=C3Developer,ou=People,dc=c3edu,dc=online"
* @returns extracted profile output "vini"
*/
export const getCnFromDn = (dn: string): string => {
  return getProfileFromMemberOf(dn);
};

export const getProfileFromFirstMemberOf = (memberOf: string[]): string => {
  try {
    if (Array.isArray(memberOf) && memberOf.length) {
      return pascalCase(memberOf[0]);
    }
  } catch (err) {
    return 'INVALID PROFILE, user must have at least on group in it\'s memberOf to extract a valid profile';
  }
};
