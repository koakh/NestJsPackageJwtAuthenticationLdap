export interface JwtValidatePayload {
  username: string;
  sub: string;
  roles: string[];
  permissions: string[];
  extraPermission: string[];
  metaData: any;
  exp: number;
  iat: number;
}
