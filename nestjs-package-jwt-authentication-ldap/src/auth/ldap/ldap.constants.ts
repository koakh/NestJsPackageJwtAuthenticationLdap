export const constants: { [key: string]: string } = {
  USER_CREATED: 'user \'${username}\' created successfully',
  USER_ADDED_DELETED_TO_GROUP: '${operation} user \'${cn}\' from group \'${group}\' successfully',
  GROUP_CREATED: 'group \'${groupName}\' created successfully',
  DEVELOPER_GROUP: 'C3Developer',
  DEVELOPER_ACCESS_TOKEN_EXPIRES_IN: '1000y',
  // occurs on create user that already exists
  // INVALID_DISTINGUISHED_NAME_ERROR: 'can\'t create user \'${username}\' with invalid distinguished name \'${distinguishedName}\'',
}