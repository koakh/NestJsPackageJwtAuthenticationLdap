export type UserDataInterface = {
  id: string,
  username: string,
  password: string,
  firstName: string,
  lastName: string,
  email: string,
  roles?: string[],
  createdDate: number,
  metaData?: object,
}