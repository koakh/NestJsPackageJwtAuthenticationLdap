/**
 * [UserAccountControl Attribute/Flag Values](https://jackstromberg.com/2013/01/useraccountcontrol-attributeflag-values/)
 */
export enum UserAccountControl {
  // enabled: NORMAL_ACCOUNT	0x0200	512
  // userAccountControl: 512
  NORMAL_ACCOUNT = 66056,
  // disabled : Disabled Account	0x0202	514
  DISABLED_ACCOUNT = 66058,
}

export enum UserObjectClass {
  USER = 'User',
}
