export interface SignJwtToken {
  userId: string;
  username: string;
  roles: string[];
  metaData?: any;
}