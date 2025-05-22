import { ValidationRules, isEmailValidation, isGenderValidation, isLengthValidation, isNumberDateValidation, isUserAccountControlValidation } from '../utils';

export const constants: { [key: string]: string } = {
  USER_CREATED: 'user \'${username}\' created successfully',
  USER_ADDED_DELETED_TO_GROUP: '${operation} user \'${cn}\' from group \'${group}\' successfully',
  GROUP_CREATED: 'group \'${groupName}\' created successfully',
  DEVELOPER_GROUP: 'C3Developer',
  DEVELOPER_ACCESS_TOKEN_EXPIRES_IN: '1000y',
  // occurs on create user that already exists
  // INVALID_DISTINGUISHED_NAME_ERROR: 'can\'t create user \'${username}\' with invalid distinguished name \'${distinguishedName}\'',
};

// test implementation
// export const CHANGE_USER_RECORD_VALIDATION: Array<ValidationRules> = [
//   // 5 validation rules
//   { givenName: [() => ['givenName error1'], () => ['givenName error2'], () => ['givenName error3'], () => ['givenName error4'], () => ['givenName error5']] },
//   // 3 validation rules
//   { sn: [() => ['sn error1', 'sn error2'], () => ['sn error3', 'sn error4']] },
//   { studentID: [() => ['studentID error1', 'studentID error2', 'studentID error3'], () => ['studentID error4', 'studentID error5', 'studentID error6']] },
//   { telephoneNumber: [() => ['telephoneNumber error1', 'telephoneNumber error2', 'telephoneNumber error3', 'telephoneNumber error4'], () => ['telephoneNumber error5', 'telephoneNumber error6', 'telephoneNumber error7', 'telephoneNumber error8']] },
// ]

// final implementation
export const CHANGE_USER_RECORD_VALIDATION: ValidationRules[] = [
  // protected field: can permit change cn, and a validation that fire if prop is sent
  // { cn: [(fieldName: string, fieldValue: string) => isLengthValidation(fieldName, fieldValue, 2, 50, true)] },
  { unicodePwd: [(fieldName: string, fieldValue: string) => isLengthValidation(fieldName, fieldValue, 4, 50, true)] },
  { givenName: [(fieldName: string, fieldValue: string) => isLengthValidation(fieldName, fieldValue, 2, 50, true)] },
  { sn: [(fieldName: string, fieldValue: string) => isLengthValidation(fieldName, fieldValue, 2, 50, true)] },
  // protected field: this have a different endpoint: https://c3edu.online/backend/v1/ldap/default-group
  // { defaultGroup: [(fieldName: string, fieldValue: string) => isLengthValidation(fieldName, fieldValue, 3, 50, true)] },
  { objectClass: [(fieldName: string, fieldValue: string) => isLengthValidation(fieldName, fieldValue, 3, 50, true)] },
  { displayName: [(fieldName: string, fieldValue: string) => isLengthValidation(fieldName, fieldValue, 3, 50, true)] },
  { jpegPhoto: [(fieldName: string, fieldValue: string) => isLengthValidation(fieldName, fieldValue, 4, 50, true)] },
  { mail: [(fieldName: string, fieldValue: string) => isEmailValidation(fieldName, fieldValue, true)] },
  { dateOfBirth: [(fieldName: string, fieldValue: string) => isNumberDateValidation(fieldName, fieldValue, true)] },
  // require to implement
  { gender: [(fieldName: string, fieldValue: string) => isGenderValidation(fieldName, fieldValue, true)] },
  { telephoneNumber: [(fieldName: string, fieldValue: string) => isLengthValidation(fieldName, fieldValue, 3, 50, true)] },
  { studentID: [(fieldName: string, fieldValue: string) => isLengthValidation(fieldName, fieldValue, 3, 50, true)] },
  { userAccountControl: [(fieldName: string, fieldValue: string) => isUserAccountControlValidation(fieldName, fieldValue)] },
];
