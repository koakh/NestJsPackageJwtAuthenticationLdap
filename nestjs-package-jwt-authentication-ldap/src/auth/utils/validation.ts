/**
 * custom ldap validation implementation
 * validationRules: Array<ValidationRules> arg ex:
 *
 * export const CHANGE_USER_RECORD_VALIDATION: Array<ValidationRules> = [
 *   { givenName: [() => true, () => true] },
 *   { sn: [() => true] },
 *   { studentID: [() => true] },
 *   { telephoneNumber: [() => true] },
 * ]
 */

// validation rule
export type ValidationRule = Array<(fieldName: string, fieldValue: string) => string[]>;
// field validation response array
export type ValidationErrorsResponse = Array<{ [key: string]: string[] }>;
// array of validation rule
export interface ValidationRules { [key: string]: ValidationRule; }

/**
 * all valid fields must be have a validationRule, else are consider a invalid fields,
 * this is useful to protect user pass wrong fields, and protected fields like cn, defaultGroup etc
 * @param fieldName
 * @param validationRules
 * @returns error message string or null if valid
 */
export const isValidRuleField = (fieldName: string, validationRules: ValidationRules[]): string => {
  const fieldValidationRules = validationRules.find((e: ValidationRules) => fieldName === Object.keys(e)[0]);
  return fieldValidationRules ? null : `invalid field ${fieldName}, this field can't be used`;
};

export const getFieldValidation = (fieldName: string, validationRules: ValidationRules[]): ValidationRule => {
  const fieldValidationRules = validationRules.find((e: ValidationRules) => fieldName === Object.keys(e)[0]);
  // Logger.log(`fieldValidationRules: [${JSON.stringify(fieldValidationRules, undefined, 2)}]`);
  return Object.values(fieldValidationRules)[0];
};

// validation functions
export const isLengthValidation = (field: string, value: string, min: number, max: number, optional: boolean = true): string[] => {
  const errors: string[] = [];
  // escape soon if is optional and value is empty
  if (optional && !value) {
    return [];
  }
  // else validate field
  if (value) {
    if (min && value.length < min) {
      errors.push(`${field} must be longer than or equal to ${min} characters`);
    }
    if (max && value.length > max) {
      errors.push(`${field} must be lower than or equal to ${max} characters`);
    }
  }
  return errors;
};

/**
 * @param value base RegEx Validation
 * @param pattern regEx pattern
 * @param message error message
 * @param optional optional
 * @returns
 */
export const isRegExValidation = (value: string, pattern: RegExp, message: string, optional: boolean = true) => {
  const errors: string[] = [];
  // escape soon, if is optional and value is empty
  if (optional && !value) {
    return [];
  }
  if (!!!pattern.test(value)) {
    errors.push(message);
  }
  return errors;
};

export const isEmailValidation = (field: string, value: string, optional: boolean = true) => {
  return isRegExValidation(
    value,
    new RegExp('^([\\w-]+(?:\\.[\\w-]+)*)@((?:[\\w-]+\\.)*\\w[\\w-]{0,66})\\.([a-z]{2,6}(?:\\.[a-z]{2})?)$', 'si'),
    `${field} must be a valid email address`,
    optional,
  );
};

export const isURLValidation = (field: string, value: string, optional: boolean = true) => {
  const pattern = new RegExp('^https?:\\/\\/' +           // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +  // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' +                       // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +                   // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' +                          // query string
    '(\\#[-a-z\\d_]*)?$', 'si');                           // fragment locator
  return isRegExValidation(
    value,
    pattern,
    `${field} must be a valid URL address`,
    optional,
  );
};

/**
 * regEx: ^[0-9]{8}$
 * ex 19721219
 */
export const isNumberDateValidation = (field: string, value: string, optional: boolean = true) => {
  return isRegExValidation(
    value,
    new RegExp('^[0-9]{8}$', 'si'),
    `${field} must be a valid number date`,
    optional,
  );
};

/**
 * regEx: ^66056|66058$
 * ex 66056 (enabled) 66058 (disabled)
 */
export const isUserAccountControlValidation = (field: string, value: string, optional: boolean = true) => {
  return isRegExValidation(
    value,
    new RegExp('^66056|66058$', 'si'),
    `${field} must be a valid user account control number`,
    optional,
  );
};

/**
 * regEx: ^[MFmf]{1}$
 * ex M, m, F, f
 */
export const isGenderValidation = (field: string, value: string, optional: boolean = true) => {
  return isRegExValidation(
    value,
    new RegExp('^[MFmf]{1}$', 'si'),
    `${field} must be a valid gender`,
    optional,
  );
};
