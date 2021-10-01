export interface SignJwtToken {
  userId: string;
  username: string;
  roles: string[];
  permissions: string[];
  metaData?: any;
}