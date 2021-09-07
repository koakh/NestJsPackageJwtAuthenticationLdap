export const constants: { [key: string]: string } = {
  USER_CREATED: 'user \'${username}\' created successfully',
  USER_ADDED_DELETED_TO_GROUP: '${operation} user \'${username}\' from group \'${group}\' successfully',
  GROUP_CREATED: 'group \'${groupName}\' created successfully',
  // occurs on create user that already exists
  // INVALID_DISTINGUISHED_NAME_ERROR: 'can\'t create user \'${username}\' with invalid distinguished name \'${distinguishedName}\'',
}