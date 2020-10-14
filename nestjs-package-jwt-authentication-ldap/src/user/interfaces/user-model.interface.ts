export interface UserModelInterface {
  id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  roles?: string[];
}
