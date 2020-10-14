export interface JwtResponsePayload {
  username: string;
  iat: string;
  exp: string;
  tokenVersion: number;
}
