import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as utils from '../../common/utils/util';
import { AddOrDeleteUserToGroupDto, ChangeDefaultGroupDto, ChangeUserRecordDto, CreateUserRecordDto, DeleteUserRecordDto, SearchUserRecordResponseDto, SearchUserRecordsDto } from './dto';
import { ChangeUserRecordOperation, Objectclass, UpdateCacheOperation } from './enums';
import { LdapService } from './ldap.service';

describe('LdapService', () => {
  let ldapService: LdapService;
  let configService: ConfigService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: 'test.env',
        }),
      ],
      controllers: [],
      providers: [
        LdapService,
        ConfigService
      ],
    }).compile();

    ldapService = moduleRef.get<LdapService>(LdapService);
    configService = moduleRef.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(ldapService).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  describe(' updateCachedUser()', () => {
    it('should test updateCachedUser (CREATE) - Successfully', async () => {
      const inputOperation: UpdateCacheOperation = UpdateCacheOperation.CREATE;
      const inputcn: string = 'c3Test';
      const spyUserRecords: SearchUserRecordResponseDto = {
        user: {
          dn: 'CN=user19,OU=C3Student,OU=People,DC=c3edu,DC=online',
          memberOf: undefined,
          controls: [],
          objectCategory: 'CN=Person,CN=Schema,CN=Configuration,DC=c3edu,DC=online',
          distinguishedName: 'CN=user19,OU=C3Student,OU=People,DC=c3edu,DC=online',
          userAccountControl: '66056',
          lastLogonTimestamp: undefined,
          cn: 'user19',
          givenName: "Nuno",
          sn: "Bento",
          email: undefined,
          displayName: 'Nuno Bento',
          gender: 'M',
          mail: 'test@critical-links.com',
          c3UserRole: undefined,
          dateOfBirth: '19711219',
          studentID: '34273462836a',
          telephoneNumber: '+3519300000',
        },
        status: 1
      };
      jest
        .spyOn(ldapService, 'getUserRecord')
        .mockImplementationOnce(async () => spyUserRecords);
      await ldapService.updateCachedUser(inputOperation, inputcn);
      expect(ldapService.getUserRecord).toHaveBeenCalledTimes(1);
    });

    it('should test updateCachedUser (UPDATE) - Successfully', async () => {
      const inputOperation: UpdateCacheOperation = UpdateCacheOperation.UPDATE;
      const inputcn: string = 'c3Test';
      const spyUserRecords: SearchUserRecordResponseDto = {
        user: {
          dn: 'CN=user19,OU=C3Student,OU=People,DC=c3edu,DC=online',
          memberOf: undefined,
          controls: [],
          objectCategory: 'CN=Person,CN=Schema,CN=Configuration,DC=c3edu,DC=online',
          distinguishedName: 'CN=user19,OU=C3Student,OU=People,DC=c3edu,DC=online',
          userAccountControl: '66056',
          lastLogonTimestamp: undefined,
          cn: 'user19',
          givenName: "Nuno",
          sn: "Bento",
          email: undefined,
          displayName: 'Nuno Bento',
          gender: 'M',
          mail: 'test@critical-links.com',
          c3UserRole: undefined,
          dateOfBirth: '19711219',
          studentID: '34273462836a',
          telephoneNumber: '+3519300000',
        },
        status: 1
      };
      jest
        .spyOn(ldapService, 'getUserRecord')
        .mockImplementationOnce(async () => spyUserRecords);
      await ldapService.updateCachedUser(inputOperation, inputcn);
      expect(ldapService.getUserRecord).toHaveBeenCalledTimes(1);
    });

    it('should test updateCachedUser (DELETE) - Successfully', async () => {
      const inputOperation: UpdateCacheOperation = UpdateCacheOperation.DELETE;
      const inputcn: string = 'c3Test';
      const spyUserRecords: SearchUserRecordResponseDto = {
        user: {
          dn: 'CN=user19,OU=C3Student,OU=People,DC=c3edu,DC=online',
          memberOf: undefined,
          controls: [],
          objectCategory: 'CN=Person,CN=Schema,CN=Configuration,DC=c3edu,DC=online',
          distinguishedName: 'CN=user19,OU=C3Administrator,OU=People,DC=c3edu,DC=online',
          userAccountControl: '66056',
          lastLogonTimestamp: undefined,
          cn: 'user19',
          givenName: "Nuno",
          sn: "Bento",
          email: undefined,
          displayName: 'Nuno Bento',
          gender: 'M',
          mail: 'test@critical-links.com',
          c3UserRole: undefined,
          dateOfBirth: '19711219',
          studentID: '34273462836a',
          telephoneNumber: '+3519300000',
        },
        status: 1
      };
      jest
        .spyOn(ldapService, 'getUserRecord');
      jest
        .spyOn(utils, 'recordToArray');
      await ldapService.updateCachedUser(inputOperation, inputcn);
      expect(utils.recordToArray).toHaveBeenCalledTimes(1);
      expect(ldapService.getUserRecord).not.toHaveBeenCalled();
    });

    it('should test updateCachedUser function - Error', async () => {
      const inputOperation: UpdateCacheOperation = UpdateCacheOperation.CREATE;
      const inputcn: string = 'c3Test';
      jest.spyOn(ldapService, 'getUserRecord').mockImplementation(() => {
        throw new Error('Something weird happened')
      });

      await ldapService.updateCachedUser(inputOperation, inputcn)
        .catch((err) => {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toBe('Something weird happened');
          expect(ldapService.getUserRecord).toHaveBeenCalledWith(inputcn);
        })
    });
  });

  describe(' getUserRecord()', () => {
    it('should test getUserRecord - Successfully', async () => {
      const result: any = {
        user: {
          dn: 'CN=c3,OU=C3Administrator,OU=People,DC=c3edu,DC=online',
          memberOf: [
            'CN=C3Administrator,OU=Groups,DC=c3edu,DC=online',
            'CN=C3Teacher,OU=Groups,DC=c3edu,DC=online',
            'CN=C3Parent,OU=Groups,DC=c3edu,DC=online',
            'CN=C3Student,OU=Groups,DC=c3edu,DC=online',
            'CN=Domain Admins,CN=Users,DC=c3edu,DC=online'
          ],
          controls: [],
          objectCategory: 'CN=Person,CN=Schema,CN=Configuration,DC=c3edu,DC=online',
          userAccountControl: '66056',
          lastLogonTimestamp: '132590739667693370',
          c3UserRole: undefined,
          dateOfBirth: undefined,
          studentID: undefined,
          telephoneNumber: undefined,
          email: undefined,
          mail: undefined,
          gender: undefined,
          cn: 'c3',
          displayName: 'C3'
        },
        status: 0
      };
      await ldapService.getUserRecord('c3').then((res) => {
        expect(res.user.dn).toStrictEqual(result.user.dn);
        expect(res.user.memberOf).toStrictEqual(result.user.memberOf);
        expect(res.user.objectCategory).toStrictEqual(result.user.objectCategory);
        expect(res.user.cn).toStrictEqual(result.user.cn);
        expect(res.user.displayName).toStrictEqual(result.user.displayName);
      });
    });

    it('should test getUserRecord - Error', async () => {
      const result: any = {
        user: {
          dn: 'CN=c3,OU=C3Administrator,OU=People,DC=c3edu,DC=online',
          memberOf: [
            'CN=C3Administrator,OU=Groups,DC=c3edu,DC=online',
            'CN=C3Teacher,OU=Groups,DC=c3edu,DC=online',
            'CN=C3Parent,OU=Groups,DC=c3edu,DC=online',
            'CN=C3Student,OU=Groups,DC=c3edu,DC=online',
            'CN=Domain Admins,CN=Users,DC=c3edu,DC=online'
          ],
          controls: [],
          objectCategory: 'CN=Person,CN=Schema,CN=Configuration,DC=c3edu,DC=online',
          userAccountControl: '66056',
          lastLogonTimestamp: '132590739667693370',
          c3UserRole: undefined,
          dateOfBirth: undefined,
          studentID: undefined,
          telephoneNumber: undefined,
          email: undefined,
          mail: undefined,
          gender: undefined,
          cn: 'c3',
          displayName: 'C3'
        },
        status: 0
      };
      await ldapService.getUserRecord('test').catch((err) => {
        expect(err.message).toBe('user not found');
        expect(err.status).toBe(0);
      });
    });
  });

  describe(' initUserRecordsCache()', () => {
    it('should test initUserRecordsCache - Successfully', async () => {
      const spyDate = 1614765831953;
      const spyElapsedTime = '3008.384';
      const spyStartMemoryUsage = { 'rss': { 'value': 263725056, 'formattedValue': '251.51 MB', 'label': 'resident Set Size - total memory allocated for the process execution' }, 'heapTotal': { 'value': 193949696, 'formattedValue': '184.96 MB', 'label': 'total size of the allocated heap' }, 'heapUsed': { 'value': 172778624, 'formattedValue': '164.77 MB', 'label': 'actual memory used during the execution' }, 'external': { 'value': 3650670, 'formattedValue': '3.48 MB', 'label': 'v8 external memory' } }
      const spyEndMemoryUsage = { 'rss': { 'value': 263827456, 'formattedValue': '251.61 MB', 'label': 'resident Set Size - total memory allocated for the process execution' }, 'heapTotal': { 'value': 194211840, 'formattedValue': '185.21 MB', 'label': 'total size of the allocated heap' }, 'heapUsed': { 'value': 173495960, 'formattedValue': '165.46 MB', 'label': 'actual memory used during the execution' }, 'external': { 'value': 3654127, 'formattedValue': '3.48 MB', 'label': 'v8 external memory' } }
      const spyCache = { 'rss': { 'value': 102400, 'formattedValue': '0.1 MB', 'label': 'resident Set Size - total memory allocated for the process execution' }, 'heapTotal': { 'value': 262144, 'formattedValue': '0.25 MB', 'label': 'total size of the allocated heap' }, 'heapUsed': { 'value': 717336, 'formattedValue': '0.68 MB', 'label': 'actual memory used during the execution' }, 'external': { 'value': 3457, 'formattedValue': '0 MB', 'label': 'v8 external memory' } };
      jest
        .spyOn(Date, 'now')
        .mockImplementation(() => spyDate);
      jest
        .spyOn(process, 'hrtime')
        .mockImplementation(() => [3008, 383721640])
      jest
        .spyOn(utils, 'getMemoryUsage')
        .mockImplementationOnce(() => spyStartMemoryUsage)
        .mockImplementationOnce(() => spyEndMemoryUsage);
      jest
        .spyOn(configService, 'get');
      const input = {
        filter: '(objectCategory=CN=Person,CN=Schema,CN=Configuration,DC=c3edu,DC=online)'
      };
      await ldapService.initUserRecordsCache(input.filter).then((res) => {
        expect(configService.get).not.toHaveBeenCalled();
        expect(res).toBeInstanceOf(Object);
        expect(res.lastUpdate).toEqual(spyDate)
        expect(res.elapsedTime).toEqual(spyElapsedTime)
        expect(res.memoryUsage.cache).toEqual(spyCache)
        expect(res.memoryUsage.system).toEqual(spyEndMemoryUsage)
      });
    });

    it('should test initUserRecordsCache - Error', async () => {
      jest
        .spyOn(process, 'hrtime')
        .mockImplementationOnce(() => { throw new Error() })
      await expect(ldapService.initUserRecordsCache(undefined)).rejects.toThrow();
      expect(process.hrtime).toHaveBeenCalled();
    });
  });

  describe(' getUserRecords()', () => {
    const input: SearchUserRecordsDto = {
      page: 1,
      perPage: 25
    };

    it('should test getUserRecords without cache.lastUpdate - Error', async () => {
      await ldapService.getUserRecords(input).catch((err) => {
        expect(err.message).toEqual('cache not yet initialized! first initialize cache and try again')
      });
    });

    it('should test getUserRecords - Successfully', async () => {
      const spyRecordArray = [
        {
          dn: 'CN=c3,OU=C3Administrator,OU=People,DC=c3edu,DC=online',
          memberOf: [
            'CN=C3Administrator,OU=Groups,DC=c3edu,DC=online',
            'CN=C3Teacher,OU=Groups,DC=c3edu,DC=online',
            'CN=C3Parent,OU=Groups,DC=c3edu,DC=online',
            'CN=C3Student,OU=Groups,DC=c3edu,DC=online',
            'CN=Domain Admins,CN=Users,DC=c3edu,DC=online',
          ],
          controls: [
          ],
          objectCategory: 'CN=Person,CN=Schema,CN=Configuration,DC=c3edu,DC=online',
          userAccountControl: '66056',
          lastLogonTimestamp: '132590739667693370',
          cn: 'c3',
          email: undefined,
          displayName: 'C3',
          gender: undefined,
          mail: undefined,
          c3UserRole: undefined,
          dateOfBirth: undefined,
          studentID: undefined,
          telephoneNumber: undefined,
        }
      ];
      const spyFilterator = [
        {
          dn: 'CN=c3,OU=C3Administrator,OU=People,DC=c3edu,DC=online',
          memberOf: [
            'CN=C3Administrator,OU=Groups,DC=c3edu,DC=online',
            'CN=C3Teacher,OU=Groups,DC=c3edu,DC=online',
            'CN=C3Parent,OU=Groups,DC=c3edu,DC=online',
            'CN=C3Student,OU=Groups,DC=c3edu,DC=online',
            'CN=Domain Admins,CN=Users,DC=c3edu,DC=online',
          ],
          controls: [
          ],
          objectCategory: 'CN=Person,CN=Schema,CN=Configuration,DC=c3edu,DC=online',
          userAccountControl: '66056',
          lastLogonTimestamp: '132590739667693370',
          cn: 'c3',
          email: undefined,
          displayName: 'C3',
          gender: undefined,
          mail: undefined,
          c3UserRole: undefined,
          dateOfBirth: undefined,
          studentID: undefined,
          telephoneNumber: undefined,
        }
      ];
      const result = {
        'page': 1,
        'perPage': 25,
        'prePage': null,
        'nextPage': null,
        'totalRecords': 1,
        'totalPages': 1,
        'data': [
          {
            'dn': 'CN=c3,OU=C3Administrator,OU=People,DC=c3edu,DC=online',
            'memberOf': [
              'CN=C3Administrator,OU=Groups,DC=c3edu,DC=online',
              'CN=C3Teacher,OU=Groups,DC=c3edu,DC=online',
              'CN=C3Parent,OU=Groups,DC=c3edu,DC=online',
              'CN=C3Student,OU=Groups,DC=c3edu,DC=online',
              'CN=Domain Admins,CN=Users,DC=c3edu,DC=online'
            ],
            'controls': [],
            'objectCategory': 'CN=Person,CN=Schema,CN=Configuration,DC=c3edu,DC=online',
            'userAccountControl': '66056',
            'c3UserRole': undefined,
            'dateOfBirth': undefined,
            'email': undefined,
            'gender': undefined,
            'mail': undefined,
            'studentID': undefined,
            'telephoneNumber': undefined,
            'lastLogonTimestamp': '132590739667693370',
            'cn': 'c3',
            'displayName': 'C3'
          }
        ]
      };
      jest
        .spyOn(utils, 'recordToArray')
        .mockImplementationOnce(() => spyRecordArray)
        .mockImplementationOnce(() => spyFilterator)
      await ldapService.initUserRecordsCache(undefined);

      await ldapService.getUserRecords(input).then((res) => {
        expect(res).toStrictEqual(result);
        expect(res).toBeInstanceOf(Object);
        expect(res.page).toEqual(input.page);
        expect(res.perPage).toEqual(input.perPage);
        expect(res.perPage).toEqual(input.perPage);
      });
    });
  });

  describe(' createUserRecord()', () => {


    it('should test createUserRecord without invalid input - Error', async () => {
      const input: CreateUserRecordDto = undefined;
      await ldapService.createUserRecord(input).catch((err) => {
        expect(err.message).toEqual(`Cannot read property 'cn' of undefined`)
      });
    });

    it('should test createUserRecord - Successfully', async () => {
      const input: CreateUserRecordDto = {
        cn: 'user_test',
        unicodePwd: '1234',
        givenName: 'Vitor',
        sn: 'Joao',
        defaultGroup: 'c3Administrator',
        displayName: 'Vitor Joao',
        objectClass: Objectclass.USER,
        mail: 'vitor.joao@critical-links.com',
        dateOfBirth: 19711219,
        gender: 'M',
        telephoneNumber: '+351910000000',
        studentID: '34273462836a'
      };
      await ldapService.initUserRecordsCache(undefined);
      await ldapService.createUserRecord(input);
      await ldapService.getUserRecord('user_test').then((result) => {
        expect(result.user.cn).toEqual('user_test')
      })
      await ldapService.deleteUserRecord({ cn: input.cn, defaultGroup: input.defaultGroup })
    });
  });

  describe(' addOrDeleteUserToGroup()', () => {
    it('should test addOrDeleteUserToGroup without invalid input - Error', async () => {
      const operation: ChangeUserRecordOperation = ChangeUserRecordOperation.ADD;
      const addUserToGroupDto: AddOrDeleteUserToGroupDto = undefined;
      await ldapService.addOrDeleteUserToGroup(operation, addUserToGroupDto).catch((err) => {
        expect(err.message).toEqual(`Cannot read property 'group' of undefined`)
      });
    });

    it('should test addOrDeleteUserToGroup - Successfully', async () => {
      const operation: ChangeUserRecordOperation = ChangeUserRecordOperation.ADD;
      const addUserToGroupDto: AddOrDeleteUserToGroupDto = { cn: 'user19', defaultGroup: 'c3student', group: 'c3teacher' };
      const inputCreateUser: CreateUserRecordDto = {
        cn: 'user19',
        unicodePwd: '1234',
        givenName: 'Joao',
        sn: 'Pedro',
        displayName: 'Joao Pedro',
        objectClass: Objectclass.USER,
        defaultGroup: 'c3student',
        mail: 'test@critical-links.com',
        dateOfBirth: 19711219,
        gender: 'M',
        telephoneNumber: '+35193000000',
        studentID: '34273462836a'
      };
      await ldapService.initUserRecordsCache(undefined);
      await ldapService.createUserRecord(inputCreateUser);
      await ldapService.addOrDeleteUserToGroup(operation, addUserToGroupDto);
      await ldapService.getUserRecord(inputCreateUser.cn).then((res) => {
        expect(res.user.memberOf).toEqual(
          expect.arrayContaining(['CN=C3Teacher,OU=Groups,DC=c3edu,DC=online'])
        )
      });
      await ldapService.deleteUserRecord({ cn: inputCreateUser.cn, defaultGroup: inputCreateUser.defaultGroup })
    });
  });

  describe(' updateDefaultGroup()', () => {
    it('should test updateDefaultGroup - Successfully', async () => {
      const changeDefaultGroup: ChangeDefaultGroupDto = { cn: 'user19', defaultGroup: 'c3student' };
      const inputCreateUser: CreateUserRecordDto = {
        cn: 'user19',
        unicodePwd: '1234',
        givenName: 'Joao',
        sn: 'Pedro',
        displayName: 'Joao Pedro',
        objectClass: Objectclass.USER,
        defaultGroup: 'c3student',
        mail: 'test@critical-links.com',
        dateOfBirth: 19711219,
        gender: 'M',
        telephoneNumber: '+35193000000',
        studentID: '34273462836a'
      };

      await ldapService.initUserRecordsCache(undefined);
      await ldapService.createUserRecord(inputCreateUser);
      await ldapService.updateDefaultGroup(changeDefaultGroup);
      await ldapService.getUserRecord(inputCreateUser.cn).then((res) => {
        expect(res.user.dn).toBe(`CN=${inputCreateUser.cn},OU=C3Teacher,OU=People,DC=c3edu,DC=online`)
        expect(res.user.memberOf).toEqual(
          expect.arrayContaining(['CN=C3Student,OU=Groups,DC=c3edu,DC=online', 'CN=C3Teacher,OU=Groups,DC=c3edu,DC=online'])
        )
      });
      await ldapService.deleteUserRecord({ cn: inputCreateUser.cn, defaultGroup: changeDefaultGroup.defaultGroup })
    });
  });

  describe(' deleteUserRecord()', () => {
    it('should test deleteUserRecord without invalid input - Error', async () => {
      const input: DeleteUserRecordDto = undefined;
      await ldapService.deleteUserRecord(input).catch((err) => {
        expect(err.message).toEqual(`Cannot read property 'cn' of undefined`)
      });
    });

    it('should test deleteUserRecord - Successfully', async () => {
      const input: DeleteUserRecordDto = {
        cn: 'user_test',
        defaultGroup: 'c3Administrator'
      };
      const creteUser: CreateUserRecordDto = {
        cn: 'user_test',
        unicodePwd: '1234',
        givenName: 'Vitor',
        sn: 'Joao',
        defaultGroup: 'c3Administrator',
        displayName: 'Vitor Joao',
        objectClass: Objectclass.USER,
        mail: 'vitor.joao@critical-links.com',
        dateOfBirth: 19711219,
        gender: 'M',
        telephoneNumber: '+351910000000',
        studentID: '34273462836a'
      };
      const inputGetRecords: SearchUserRecordsDto = {
        page: 1,
        perPage: 25
      }
      await ldapService.initUserRecordsCache(undefined);
      await ldapService.createUserRecord(creteUser);
      await ldapService.deleteUserRecord(input);
      await ldapService.getUserRecords(inputGetRecords).then((result) => {
        expect(result.data).toEqual(
          expect.arrayContaining([
            expect.not.objectContaining({ dn: 'CN=user_test,OU=C3Administrator,OU=People,DC=c3edu,DC=online' })
          ])
        )
      })
    });
  });

  describe(' changeUserRecord()', () => {
    it('should test changeUserRecord without invalid input - Error', async () => {
      const input: ChangeUserRecordDto = undefined;
      await ldapService.changeUserRecord(input).catch((err) => {
        expect(err.message).toEqual(`Cannot read property 'cn' of undefined`)
      });
    });

    it('should test changeUserRecord - Successfully', async () => {
      const input: ChangeUserRecordDto = {
        cn: 'user_test',
        defaultGroup: 'c3Administrator',
        changes: [
          {
            operation: 'replace',
            modification: {
              displayName: 'Name Changed '
            }
          }
        ]
      };
      const deleteUser: DeleteUserRecordDto = {
        cn: 'user_test',
        defaultGroup: 'c3Administrator'
      };
      const creteUser: CreateUserRecordDto = {
        cn: 'user_test',
        unicodePwd: '1234',
        givenName: 'Vitor',
        sn: 'Joao',
        defaultGroup: 'c3Administrator',
        displayName: 'Vitor Joao',
        objectClass: Objectclass.USER,
        mail: 'vitor.joao@critical-links.com',
        dateOfBirth: 19711219,
        gender: 'M',
        telephoneNumber: '+351910000000',
        studentID: '34273462836a'
      };
      const inputGetRecords: SearchUserRecordsDto = {
        page: 1,
        perPage: 25
      }
      await ldapService.initUserRecordsCache(undefined);
      await ldapService.createUserRecord(creteUser);
      await ldapService.changeUserRecord(input);
      await ldapService.getUserRecord('user_test').then((result) => {
        expect(result.user.displayName).toEqual('Name Changed ')
      })
      await ldapService.deleteUserRecord(deleteUser);
    });
  });

  describe(' changeUserProfilePassword()', () => {
    it('should test changeUserProfilePassword with oldPassword==NewPassword - Error', async () => {
      const inputUser: string = 'testError';
      const input = {
        defaultGroup: 'c3student',
        oldunicodePwd: 'testNew',
        newunicodePwd: 'testNew'
      };
      await ldapService.changeUserProfilePassword(inputUser, input).catch((err) => {
        expect(err.message).toEqual(`oldPassword and newPassword are equal`)
      });
    });

    it('should test changeUserProfilePassword without a property - Error', async () => {
      const inputUser: string = 'testError';
      const input = {
        defaultGroup: 'c3student',
        newunicodePwd: 'testNew'
      };
      await ldapService.changeUserProfilePassword(inputUser, (input as any)).catch((err) => {
        expect(err.message).toEqual(`you must pass a valid oldPassword and newPassword properties`)
      });
    });

    it('should test changeUserProfilePassword - Successfully', async () => {
      const input = {
        defaultGroup: 'c3Administrator',
        oldunicodePwd: '1234',
        newunicodePwd: 'testNew'
      };
      const inputReverse = {
        defaultGroup: 'c3Administrator',
        oldunicodePwd: 'testNew',
        newunicodePwd: '1234'
      };
      const deleteUser: DeleteUserRecordDto = {
        cn: 'user_test',
        defaultGroup: 'c3Administrator'
      };
      const creteUser: CreateUserRecordDto = {
        cn: 'user_test',
        unicodePwd: '1234',
        givenName: 'Vitor',
        sn: 'Joao',
        defaultGroup: 'c3Administrator',
        displayName: 'Vitor Joao',
        objectClass: Objectclass.USER,
        mail: 'vitor.joao@critical-links.com',
        dateOfBirth: 19711219,
        gender: 'M',
        telephoneNumber: '+351910000000',
        studentID: '34273462836a'
      };
      await ldapService.initUserRecordsCache(undefined);
      await ldapService.createUserRecord(creteUser);
      await ldapService.changeUserProfilePassword(creteUser.cn, input);
      await ldapService.changeUserProfilePassword(creteUser.cn, inputReverse).catch((err) => {
        expect(err.lde_message).toContain('check_password_restrictions: the password was already used (in history)!');
      });
      await ldapService.deleteUserRecord(deleteUser);
    });
  });
});
