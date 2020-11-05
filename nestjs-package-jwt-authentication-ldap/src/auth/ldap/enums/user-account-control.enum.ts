/**
 * [UserAccountControl Attribute/Flag Values](https://jackstromberg.com/2013/01/useraccountcontrol-attributeflag-values/)
 */
export enum UserAccountControl {
  // enabled: NORMAL_ACCOUNT	0x0200	512
  // userAccountControl: 512 | old c3 code 66056
  NORMAL_ACCOUNT = 512,
  // disabled : Disabled Account	0x0202	514 | old c3 code 66058
  DISABLED_ACCOUNT = 514,
}
