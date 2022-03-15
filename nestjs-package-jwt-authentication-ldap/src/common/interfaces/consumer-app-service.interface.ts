import { JwtSecrets } from "./jwt-secrets.interface";

export interface ConsumerAppService {
  getWelcome: (name: string) => string;
  licenseState: () => any;
  initRenewTokenSecrets(): JwtSecrets;
  getJwtSecrets: () => JwtSecrets;
  singleSignOn?: (req: any, res: any) => any;
  changePassword?: (username: string, password: string) => any;
  // events
  onCreateUserRecord: () => void; //ok
  onChangeUserRecord: () => void; //ok
  onDeleteUserRecord: () => void; //ok
  onAddOrDeleteUserToGroup: () => void; //ok
  onChangeUserProfilePassword: () => void; //ok 
  onUpdateDefaultGroup: () => void; //ok
  onCreateGroupRecord: () => void; //ok
  onDeleteGroupRecord: () => void; // ok onDeleteGroupRecord
}