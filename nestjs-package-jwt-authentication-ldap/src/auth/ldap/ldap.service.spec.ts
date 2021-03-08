import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as utils from '../../common/utils/util';
// tslint:disable-next-line:max-line-length
import { AddOrDeleteUserToGroupDto, ChangeUserRecordDto, CreateUserRecordDto, DeleteUserRecordDto, SearchUserRecordResponseDto, SearchUserRecordsDto } from './dto';
import { ChangeUserRecordOperation, UpdateCacheOperation } from './enums';
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
            const inputUsername: string = 'c3Test';
            const spyUserRecords: SearchUserRecordResponseDto = {
                user: {
                    dn: 'CN=user19,OU=C3Student,OU=People,DC=c3edu,DC=online',
                    memberOf: undefined,
                    controls: [],
                    objectCategory: 'CN=Person,CN=Schema,CN=Configuration,DC=c3edu,DC=online',
                    userAccountControl: '66056',
                    lastLogonTimestamp: undefined,
                    username: 'user19',
                    email: undefined,
                    displayName: 'Nuno Bento',
                    gender: 'M',
                    mail: 'test@critical-links.com',
                    C3UserRole: undefined,
                    dateOfBirth: '19711219',
                    studentID: '34273462836a',
                    telephoneNumber: '+3519300000',
                },
                status: 1
            };
            jest
                .spyOn(ldapService, 'getUserRecord')
                .mockImplementationOnce(async () => spyUserRecords);
            await ldapService.updateCachedUser(inputOperation, inputUsername);
            expect(ldapService.getUserRecord).toHaveBeenCalledTimes(1);
        });

        it('should test updateCachedUser (UPDATE) - Successfully', async () => {

            const inputOperation: UpdateCacheOperation = UpdateCacheOperation.UPDATE;
            const inputUsername: string = 'c3Test';
            const spyUserRecords: SearchUserRecordResponseDto = {
                user: {
                    dn: 'CN=user19,OU=C3Student,OU=People,DC=c3edu,DC=online',
                    memberOf: undefined,
                    controls: [],
                    objectCategory: 'CN=Person,CN=Schema,CN=Configuration,DC=c3edu,DC=online',
                    userAccountControl: '66056',
                    lastLogonTimestamp: undefined,
                    username: 'user19',
                    email: undefined,
                    displayName: 'Nuno Bento',
                    gender: 'M',
                    mail: 'test@critical-links.com',
                    C3UserRole: undefined,
                    dateOfBirth: '19711219',
                    studentID: '34273462836a',
                    telephoneNumber: '+3519300000',
                },
                status: 1
            };
            jest
                .spyOn(ldapService, 'getUserRecord')
                .mockImplementationOnce(async () => spyUserRecords);
            await ldapService.updateCachedUser(inputOperation, inputUsername);
            expect(ldapService.getUserRecord).toHaveBeenCalledTimes(1);
        });

        it('should test updateCachedUser (DELETE) - Successfully', async () => {

            const inputOperation: UpdateCacheOperation = UpdateCacheOperation.DELETE;
            const inputUsername: string = 'c3Test';
            const spyUserRecords: SearchUserRecordResponseDto = {
                user: {
                    dn: 'CN=user19,OU=C3Student,OU=People,DC=c3edu,DC=online',
                    memberOf: undefined,
                    controls: [],
                    objectCategory: 'CN=Person,CN=Schema,CN=Configuration,DC=c3edu,DC=online',
                    userAccountControl: '66056',
                    lastLogonTimestamp: undefined,
                    username: 'user19',
                    email: undefined,
                    displayName: 'Nuno Bento',
                    gender: 'M',
                    mail: 'test@critical-links.com',
                    C3UserRole: undefined,
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
            await ldapService.updateCachedUser(inputOperation, inputUsername);
            expect(utils.recordToArray).toHaveBeenCalledTimes(1);
            expect(ldapService.getUserRecord).not.toHaveBeenCalled();
        });

        it('should test updateCachedUser function - Error', async () => {
            const inputOperation: UpdateCacheOperation = UpdateCacheOperation.CREATE;
            const inputUsername: string = 'c3Test';
            jest.spyOn(ldapService, 'getUserRecord').mockImplementation(() => {
                throw new Error('Something weird happened')
            });

            await ldapService.updateCachedUser(inputOperation, inputUsername)
                .catch((err) => {
                    expect(err).toBeInstanceOf(Error);
                    expect(err.message).toBe('Something weird happened');
                    expect(ldapService.getUserRecord).toHaveBeenCalledWith(inputUsername);
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
                    C3UserRole: undefined,
                    dateOfBirth: undefined,
                    studentID: undefined,
                    telephoneNumber: undefined,
                    email: undefined,
                    mail: undefined,
                    gender: undefined,
                    username: 'c3',
                    displayName: 'C3'
                },
                status: 0
            };
            await ldapService.getUserRecord('c3').then((res) => {
                expect(res).toStrictEqual(result);
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
                    C3UserRole: undefined,
                    dateOfBirth: undefined,
                    studentID: undefined,
                    telephoneNumber: undefined,
                    email: undefined,
                    mail: undefined,
                    gender: undefined,
                    username: 'c3',
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
                    username: 'c3',
                    email: undefined,
                    displayName: 'C3',
                    gender: undefined,
                    mail: undefined,
                    C3UserRole: undefined,
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
                    username: 'c3',
                    email: undefined,
                    displayName: 'C3',
                    gender: undefined,
                    mail: undefined,
                    C3UserRole: undefined,
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
                        'C3UserRole': undefined,
                        'dateOfBirth': undefined,
                        'email': undefined,
                        'gender': undefined,
                        'mail': undefined,
                        'studentID': undefined,
                        'telephoneNumber': undefined,
                        'lastLogonTimestamp': '132590739667693370',
                        'username': 'c3',
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
                expect(err.message).toEqual(`Cannot read property 'username' of undefined`)
            });
        });

        it('should test createUserRecord - Successfully', async () => {
            const input: CreateUserRecordDto = {
                username: 'user_test',
                password: '1234',
                firstName: 'Vitor',
                lastName: 'Joao',
                defaultGroup: 'c3Administrator',
                displayName: 'Vitor Joao',
                objectClass: 'User',
                mail: 'vitor.joao@critical-links.com',
                dateOfBirth: 19711219,
                gender: 'M',
                telephoneNumber: '+351910000000',
                studentID: '34273462836a'
            };
            const inputGetRecords: SearchUserRecordsDto = {
                page: 1,
                perPage: 25
            };
            await ldapService.initUserRecordsCache(undefined);
            await ldapService.createUserRecord(input);
            // await ldapService.getUserRecords(inputGetRecords).then((result) => {
            //     expect(result.data).toEqual(
            //         expect.arrayContaining([
            //             expect.objectContaining({ dn: 'CN=user_test,OU=C3Administrator,OU=People,DC=c3edu,DC=online' })
            //         ])
            //     )
            // })
            await ldapService.getUserRecord('user_test').then((result) => {
                expect(result.user.username).toEqual('user_test')
            })
            await ldapService.deleteUserRecord({ username: input.username, defaultGroup: input.defaultGroup })
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
            const addUserToGroupDto: AddOrDeleteUserToGroupDto = { username: 'user19', defaultGroup: 'c3student', group: 'c3teacher' };
            const inputCreateUser: CreateUserRecordDto = {
                username: 'user19',
                password: 'secret',
                firstName: 'Nuno',
                lastName: 'Bento',
                displayName: 'Nuno Bento',
                objectClass: 'User',
                defaultGroup: 'c3student',
                mail: 'nuno.bento@critical-links.com',
                dateOfBirth: 19711219,
                gender: 'M',
                telephoneNumber: '+351936202288',
                studentID: '34273462836a'
            };
            await ldapService.initUserRecordsCache(undefined);
            await ldapService.createUserRecord(inputCreateUser);
            await ldapService.addOrDeleteUserToGroup(operation, addUserToGroupDto);
            await ldapService.getUserRecord(inputCreateUser.username).then((res) => {
                expect(res.user.memberOf).toEqual(
                    expect.arrayContaining(['CN=C3Teacher,OU=Groups,DC=c3edu,DC=online'])
                )
            });
            await ldapService.deleteUserRecord({ username: inputCreateUser.username, defaultGroup: inputCreateUser.defaultGroup })
        });
    });

    describe(' deleteUserRecord()', () => {
        it('should test deleteUserRecord without invalid input - Error', async () => {
            const input: DeleteUserRecordDto = undefined;
            await ldapService.deleteUserRecord(input).catch((err) => {
                expect(err.message).toEqual(`Cannot read property 'username' of undefined`)
            });
        });

        it('should test deleteUserRecord - Successfully', async () => {
            const input: DeleteUserRecordDto = {
                username: 'user_test',
                defaultGroup: 'c3Administrator'
            };
            const creteUser: CreateUserRecordDto = {
                username: 'user_test',
                password: '1234',
                firstName: 'Vitor',
                lastName: 'Joao',
                defaultGroup: 'c3Administrator',
                displayName: 'Vitor Joao',
                objectClass: 'User',
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
                expect(err.message).toEqual(`Cannot read property 'username' of undefined`)
            });
        });

        it('should test changeUserRecord - Successfully', async () => {
            const input: ChangeUserRecordDto = {
                username: 'user_test',
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
                username: 'user_test',
                defaultGroup: 'c3Administrator'
            };
            const creteUser: CreateUserRecordDto = {
                username: 'user_test',
                password: '1234',
                firstName: 'Vitor',
                lastName: 'Joao',
                defaultGroup: 'c3Administrator',
                displayName: 'Vitor Joao',
                objectClass: 'User',
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
                oldPassword: 'testNew',
                newPassword: 'testNew'
            };
            await ldapService.changeUserProfilePassword(inputUser, input).catch((err) => {
                expect(err.message).toEqual(`oldPassword and newPassword are equal`)
            });
        });

        it('should test changeUserProfilePassword without a property - Error', async () => {
            const inputUser: string = 'testError';
            const input = {
                defaultGroup: 'c3student',
                newPassword: 'testNew'
            };
            await ldapService.changeUserProfilePassword(inputUser, (input as any)).catch((err) => {
                expect(err.message).toEqual(`you must pass a valid oldPassword and newPassword properties`)
            });
        });

        it('should test changeUserProfilePassword - Successfully', async () => {
            const input = {
                defaultGroup: 'c3Administrator',
                oldPassword: '1234',
                newPassword: 'testNew'
            };
            const inputReverse = {
                defaultGroup: 'c3Administrator',
                oldPassword: 'testNew',
                newPassword: '1234'
            };
            const deleteUser: DeleteUserRecordDto = {
                username: 'user_test',
                defaultGroup: 'c3Administrator'
            };
            const creteUser: CreateUserRecordDto = {
                username: 'user_test',
                password: '1234',
                firstName: 'Vitor',
                lastName: 'Joao',
                defaultGroup: 'c3Administrator',
                displayName: 'Vitor Joao',
                objectClass: 'User',
                mail: 'vitor.joao@critical-links.com',
                dateOfBirth: 19711219,
                gender: 'M',
                telephoneNumber: '+351910000000',
                studentID: '34273462836a'
            };
            await ldapService.initUserRecordsCache(undefined);
            await ldapService.createUserRecord(creteUser);
            await ldapService.changeUserProfilePassword(creteUser.username, input);
            await ldapService.changeUserProfilePassword(creteUser.username, inputReverse).catch((err) => {
                expect(err.lde_message).toContain('check_password_restrictions: the password was already used (in history)!');
            });
            await ldapService.deleteUserRecord(deleteUser);
        });
    });
});
