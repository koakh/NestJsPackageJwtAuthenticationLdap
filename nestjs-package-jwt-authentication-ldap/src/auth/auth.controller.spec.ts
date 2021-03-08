import { HttpStatus, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { mockRequest, mockResponse } from 'jest-mock-req-res';
import { mockedConfigService } from '../auth/utils/mocks/config.service';
import { mockedJwtService } from '../auth/utils/mocks/jwt.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';
import { AccessToken, SignJwtToken } from './interfaces';
import { SearchUserRecordResponseDto } from './ldap/dto';
import { LdapService } from './ldap/ldap.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let jwtService: JwtService;
  let ldapService: LdapService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: 'test.env',
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        LdapService,
        {
          provide: ConfigService,
          useValue: mockedConfigService
        },
        {
          provide: JwtService,
          useValue: mockedJwtService
        },
      ],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
    jwtService = moduleRef.get<JwtService>(JwtService);
    ldapService = moduleRef.get<LdapService>(LdapService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  describe(' /login', () => {
    it('should test getWhitelisting - Successfully', async () => {
      const input: LoginDto = {
        username: 'cTest', password: 'test', user: {
          dn: 'CN=c3,OU=C3Administrator,OU=People,DC=c3edu,DC=online',
          controls: [
          ],
          userPrincipalName: '',
          cn: 'c3',
          memberOf: [
            'CN=C3Administrator,OU=Groups,DC=c3edu,DC=online',
            'CN=C3Teacher,OU=Groups,DC=c3edu,DC=online',
            'CN=C3Parent,OU=Groups,DC=c3edu,DC=online',
            'CN=C3Student,OU=Groups,DC=c3edu,DC=online',
            'CN=Domain Admins,CN=Users,DC=c3edu,DC=online',
          ],
        }
      };
      const accessTokenTest: AccessToken = { accessToken: 'test token' };
      const refreshTokenTest: AccessToken = { accessToken: 'test token' };
      const req = mockRequest({ body: input });
      const res = mockResponse();
      const tokenVersion: number = 1;
      jest
        .spyOn(authService, 'signJwtToken')
        .mockImplementationOnce(async () => accessTokenTest);
      jest
        .spyOn(authService.usersStore, 'incrementTokenVersion')
        .mockImplementationOnce(() => tokenVersion);
      jest
        .spyOn(authService, 'signRefreshToken')
        .mockImplementationOnce(async () => refreshTokenTest);
      jest
        .spyOn(authService, 'sendRefreshToken')
        .mockImplementationOnce(async () => { return Promise.resolve() });
      await authController.login(req.body, res);
      expect(res.send).toHaveBeenCalled();
    })

    it('should test getWhitelisting - empty memberOf', async () => {
      const input: LoginDto = {
        username: 'cTest', password: 'test', user: {
          dn: 'CN=c3,OU=C3Administrator,OU=People,DC=c3edu,DC=online',
          controls: [
          ],
          userPrincipalName: '',
          cn: 'c3',
          memberOf: undefined,
        }
      };
      const accessTokenTest: AccessToken = { accessToken: 'test token' };
      const refreshTokenTest: AccessToken = { accessToken: 'test token' };
      const req = mockRequest({ body: input });
      const res = mockResponse();
      const tokenVersion: number = 1;
      jest
        .spyOn(authService, 'signJwtToken')
        .mockImplementationOnce(async () => accessTokenTest);
      jest
        .spyOn(authService.usersStore, 'incrementTokenVersion')
        .mockImplementationOnce(() => tokenVersion);
      jest
        .spyOn(authService, 'signRefreshToken')
        .mockImplementationOnce(async () => refreshTokenTest);
      jest
        .spyOn(authService, 'sendRefreshToken')
        .mockImplementationOnce(async () => { return Promise.resolve() });
      await authController.login(req.body, res);
      expect(res.send).toHaveBeenCalled();

    })
  })

  describe(' /refresh-token', () => {

    beforeEach(() => {
      jest.clearAllMocks();
    })
    it('should test ldapRefreshToken - Successfully', async () => {
      const accessTokenTest: string = 'test token';
      const refreshTokenTest: AccessToken = { accessToken: 'test token' };
      const spyJwtVerify = {
        username: 'c3Test',
        sub: 'CN=c3,OU=C3Administrator,OU=People,DC=c3edu,DC=online',
        roles: [
          'C3_ADMINISTRATOR',
          'C3_TEACHER',
          'C3_PARENT',
          'C3_STUDENT',
          'DOMAIN_ADMINS',
        ],
        tokenVersion: 1,
        iat: 1613988548,
        exp: 1614593348,
      };
      const spyLdapUser: SearchUserRecordResponseDto = {
        user: {
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
          lastLogonTimestamp: '132576251909012870',
          username: 'c3',
          email: undefined,
          displayName: 'C3_Test',
          gender: undefined,
          mail: undefined,
          C3UserRole: undefined,
          dateOfBirth: undefined,
          studentID: undefined,
          telephoneNumber: undefined,
        },
        status: 1
      };
      const spyRoles = ['C3_ADMINISTRATOR', 'C3_TEACHER', 'C3_PARENT', 'C3_STUDENT', 'DOMAIN_ADMINS'];
      const spySignJwt = { accessToken: accessTokenTest };
      const req = mockRequest({ cookies: { jid: accessTokenTest } });
      const res = mockResponse();
      const tokenVersion: number = 1;
      const spySignJwtToken: SignJwtToken = { username: spyLdapUser.user.username, userId: spyLdapUser.user.dn, roles: spyRoles };
      jest
        .spyOn(jwtService, 'verify')
        .mockReturnValueOnce(spyJwtVerify);
      jest
        .spyOn(ldapService, 'getUserRecord')
        .mockImplementationOnce(async () => spyLdapUser);
      jest
        .spyOn(authService, 'getRolesFromMemberOf')
        .mockImplementationOnce(() => spyRoles);
      jest
        .spyOn(authService, 'signJwtToken')
        .mockImplementationOnce(async () => spySignJwt);
      jest
        .spyOn(authService, 'signRefreshToken')
        .mockImplementationOnce(async () => refreshTokenTest);
      jest
        .spyOn(authService.usersStore, 'getTokenVersion')
        .mockImplementationOnce(() => tokenVersion);
      jest
        .spyOn(authService, 'sendRefreshToken')
        .mockImplementationOnce(async () => { return Promise.resolve() });
      await authController.ldapRefreshToken(req, res);
      expect(jwtService.verify).toHaveBeenCalled();
      expect(ldapService.getUserRecord).toHaveBeenCalledWith(spyJwtVerify.username);
      expect(authService.getRolesFromMemberOf).toHaveBeenCalledWith(spyLdapUser.user.memberOf);
      expect(authService.signJwtToken).toHaveBeenCalledWith(spySignJwtToken);
      expect(authService.usersStore.getTokenVersion).toHaveBeenCalledWith(spyLdapUser.user.username);
      expect(authService.signRefreshToken).toHaveBeenCalledWith(spySignJwtToken, tokenVersion);
      expect(authService.sendRefreshToken).toHaveBeenCalledWith(res, refreshTokenTest);
      expect(res.send).toHaveBeenCalledWith({ valid: true, accessToken: accessTokenTest });
    })

    it('should test ldapRefreshToken - without Token', async () => {
      const req = mockRequest();
      const res = mockResponse();
      await authController.ldapRefreshToken(req, res);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(res.send).toHaveBeenCalledWith({ valid: false, accessToken: '' });
    })

    it('should test ldapRefreshToken - jwtService verify failed', async () => {
      const accessTokenTest: string = 'test token';
      const spyLdapUser: SearchUserRecordResponseDto = {
        user: {
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
          lastLogonTimestamp: '132576251909012870',
          username: 'c3',
          email: undefined,
          displayName: 'C3_Test',
          gender: undefined,
          mail: undefined,
          C3UserRole: undefined,
          dateOfBirth: undefined,
          studentID: undefined,
          telephoneNumber: undefined,
        },
        status: 1
      };
      const spyRoles = ['C3_ADMINISTRATOR', 'C3_TEACHER', 'C3_PARENT', 'C3_STUDENT', 'DOMAIN_ADMINS'];
      const req = mockRequest({ cookies: { jid: accessTokenTest } });
      const res = mockResponse();
      jest
        .spyOn(jwtService, 'verify')
        .mockImplementationOnce(() => { throw new Error('test') })
      jest
        .spyOn(Logger, 'error');
      await authController.ldapRefreshToken(req, res);
      expect(jwtService.verify).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(res.send).toHaveBeenCalledWith({ valid: false, accessToken: '' });
      expect(Logger.error).toHaveBeenCalled();
    })

    it('should test ldapRefreshToken - User Records undefined', async () => {
      const accessTokenTest: string = 'test token';
      const spyJwtVerify = {
        username: 'c3Test',
        sub: 'CN=c3,OU=C3Administrator,OU=People,DC=c3edu,DC=online',
        roles: [
          'C3_ADMINISTRATOR',
          'C3_TEACHER',
          'C3_PARENT',
          'C3_STUDENT',
          'DOMAIN_ADMINS',
        ],
        tokenVersion: 1,
        iat: 1613988548,
        exp: 1614593348,
      };
      const spyLdapUser: any = { status: 1 };
      const spyRoles = ['C3_ADMINISTRATOR', 'C3_TEACHER', 'C3_PARENT', 'C3_STUDENT', 'DOMAIN_ADMINS'];
      const req = mockRequest({ cookies: { jid: accessTokenTest } });
      const res = mockResponse();
      jest
        .spyOn(jwtService, 'verify')
        .mockReturnValueOnce(spyJwtVerify);
      jest
        .spyOn(ldapService, 'getUserRecord')
        .mockImplementationOnce(async () => spyLdapUser);
      jest
        .spyOn(authService, 'getRolesFromMemberOf')
        .mockImplementationOnce(() => spyRoles);
      await authController.ldapRefreshToken(req, res);
      expect(jwtService.verify).toHaveBeenCalled();
      expect(ldapService.getUserRecord).toHaveBeenCalledWith(spyJwtVerify.username);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(res.send).toHaveBeenCalledWith({ valid: false, accessToken: '' });
    })

    it('should test ldapRefreshToken - tokenVersion !== payload.tokenVersion', async () => {
      const accessTokenTest: string = 'test token';
      const spyJwtVerify = {
        username: 'c3Test',
        sub: 'CN=c3,OU=C3Administrator,OU=People,DC=c3edu,DC=online',
        roles: [
          'C3_ADMINISTRATOR',
          'C3_TEACHER',
          'C3_PARENT',
          'C3_STUDENT',
          'DOMAIN_ADMINS',
        ],
        tokenVersion: 1,
        iat: 1613988548,
        exp: 1614593348,
      };
      const spyLdapUser: SearchUserRecordResponseDto = {
        user: {
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
          lastLogonTimestamp: '132576251909012870',
          username: 'c3',
          email: undefined,
          displayName: 'C3_Test',
          gender: undefined,
          mail: undefined,
          C3UserRole: undefined,
          dateOfBirth: undefined,
          studentID: undefined,
          telephoneNumber: undefined,
        },
        status: 1
      };
      const spyRoles = ['C3_ADMINISTRATOR', 'C3_TEACHER', 'C3_PARENT', 'C3_STUDENT', 'DOMAIN_ADMINS'];
      const spySignJwt = { accessToken: accessTokenTest };
      const req = mockRequest({ cookies: { jid: accessTokenTest } });
      const res = mockResponse();
      const tokenVersion: number = 2;
      const spySignJwtToken: SignJwtToken = { username: spyLdapUser.user.username, userId: spyLdapUser.user.dn, roles: spyRoles };
      jest
        .spyOn(jwtService, 'verify')
        .mockReturnValueOnce(spyJwtVerify);
      jest
        .spyOn(ldapService, 'getUserRecord')
        .mockImplementationOnce(async () => spyLdapUser);
      jest
        .spyOn(authService, 'getRolesFromMemberOf')
        .mockImplementationOnce(() => spyRoles);
      jest
        .spyOn(authService, 'signJwtToken')
        .mockImplementationOnce(async () => spySignJwt);
      jest
        .spyOn(authService.usersStore, 'getTokenVersion')
        .mockImplementationOnce(() => tokenVersion);
      await authController.ldapRefreshToken(req, res);
      expect(jwtService.verify).toHaveBeenCalled();
      expect(ldapService.getUserRecord).toHaveBeenCalledWith(spyJwtVerify.username);
      expect(authService.getRolesFromMemberOf).toHaveBeenCalledWith(spyLdapUser.user.memberOf);
      expect(authService.signJwtToken).toHaveBeenCalledWith(spySignJwtToken);
      expect(authService.usersStore.getTokenVersion).toHaveBeenCalledWith(spyLdapUser.user.username);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(res.send).toHaveBeenCalledWith({ valid: false, accessToken: '' });
    })
  })

  describe(' /revoke-refresh-token', () => {
    it('should test revokeUserRefreshToken - Successfully', async () => {
      const input: { username: string } = { username: 'cTest' };
      jest
        .spyOn(authService.usersStore, 'incrementTokenVersion')
        .mockImplementationOnce(() => 1);
      await expect(authController.revokeUserRefreshToken(input)).resolves.toEqual({ version: 1 });
      expect(authService.usersStore.incrementTokenVersion).toHaveBeenCalledWith(input.username);
    })

    it('should test revokeUserRefreshToken - invalid User', async () => {
      const input = { username: undefined };
      jest
        .spyOn(authService.usersStore, 'incrementTokenVersion')
        .mockImplementationOnce(() => { throw new Error('test') });
      jest
        .spyOn(Logger, 'error');
      await authController.revokeUserRefreshToken(input);
      expect(Logger.error).toHaveBeenCalledWith('test', null, AuthController.name);
    })

    it('should test revokeUserRefreshToken - invalid User without error message', async () => {
      const input = { username: undefined };
      jest
        .spyOn(authService.usersStore, 'incrementTokenVersion')
        .mockImplementationOnce(() => { throw new Error() });
      jest
        .spyOn(Logger, 'error');
      await authController.revokeUserRefreshToken(input);
      expect(Logger.error).toHaveBeenCalled();
    })
  })

  describe(' /logout', () => {
    it('should test logOut - Successfully', async () => {
      const res = mockResponse();
      jest
        .spyOn(authService, 'sendRefreshToken');
      await authController.logOut(res);
      expect(authService.sendRefreshToken).toHaveBeenCalledWith(res, { accessToken: '' });
      expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(res.send).toHaveBeenCalledWith({ logOut: true });
    })
  })
});
