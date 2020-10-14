export default interface ValidateUser {
  id: string | number;
  username: string;
  password: string;
  hashPassword: string;
}