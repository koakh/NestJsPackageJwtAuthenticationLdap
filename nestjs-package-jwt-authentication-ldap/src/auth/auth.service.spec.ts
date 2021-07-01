import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { mockResponse } from 'jest-mock-req-res';
import { AuthService } from './auth.service';
import { JwtResponsePayload, SignJwtToken } from './interfaces';
import { mockedJwtService } from './utils/mocks/jwt.service';
import * as utils from './utils/util';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: 'test.env',
        }),
      ],

      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockedJwtService
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  describe(' signJwtToken()', () => {
    it('should test signJwtToken - Successfully', async () => {

      const input: SignJwtToken = { username: 'c3', userId: 'CN=c3,OU=C3Administrator,OU=People,DC=c3edu,DC=online', roles: ['C3_ADMINISTRATOR', 'C3_TEACHER', 'C3_PARENT', 'C3_STUDENT', 'DOMAIN_ADMINS'] };
      const spyToken: string = 'testToken'
      jest
        .spyOn(jwtService, 'sign')
        .mockImplementationOnce(() => spyToken);
      await service.signJwtToken(input).then((res) => {
        expect(res).toEqual({ accessToken: spyToken })
        expect(jwtService.sign).toBeCalledTimes(1);
      })
    });
  });

  describe(' signRefreshToken()', () => {
    it('should test signRefreshToken - Successfully', async () => {
      const signJwtToken: SignJwtToken = {
        username: 'c3',
        userId: 'CN=c3,OU=C3Administrator,OU=People,DC=c3edu,DC=online',
        roles: ['C3_ADMINISTRATOR', 'C3_TEACHER', 'C3_PARENT', 'C3_STUDENT', 'DOMAIN_ADMINS']
      };
      const tokenVersion: number = 1;
      const spyToken: string = 'testRefreshToken'
      jest
        .spyOn(jwtService, 'sign')
        .mockImplementationOnce(() => spyToken);
      await service.signRefreshToken(signJwtToken, tokenVersion).then((res) => {
        expect(res).toEqual({ accessToken: spyToken })
        expect(jwtService.sign).toBeCalledTimes(1);
      })
    });
  });

  describe(' sendRefreshToken()', () => {
    it('should test sendRefreshToken - Successfully', async () => {
      const spyToken = 'testRefreshToken'
      const spyAccessToken = { accessToken: spyToken }
      const res = mockResponse()
      await service.sendRefreshToken(res, spyAccessToken);
      expect(res.cookie).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledWith('jid', spyAccessToken.accessToken, { httpOnly: true });
    });
  });

  describe(' getJwtPayLoad()', () => {
    it('should test getJwtPayLoad - Successfully', async () => {
      const spyToken: string = 'testRefreshToken'
      const spyJwtVerify: JwtResponsePayload = { username: 'c3', iat: 'iat', exp: 'exp', tokenVersion: 1 };
      jest
        .spyOn(jwtService, 'verify')
        .mockImplementationOnce(() => spyJwtVerify);
      await expect(service.getJwtPayLoad(spyToken)).toEqual(spyJwtVerify);
      expect(jwtService.verify).toHaveBeenCalledWith(spyToken);
    });
  });

  describe(' bcryptValidate()', () => {
    it('should test bcryptValidate - Successfully', async () => {
      const password: string = 'testPassword'
      const hashPassword: string = 'testHashPassword';
      jest
        .spyOn(bcrypt, 'compareSync')
        .mockImplementationOnce(() => true);
      await expect(service.bcryptValidate(password, hashPassword)).toBe(true);
      expect(bcrypt.compareSync).toHaveBeenCalledWith(password, hashPassword);
    });
  });

  describe(' hashPassword()', () => {
    it('should test hashPassword - Successfully', async () => {
      const password: string = 'testPassword';
      const hashPassword: string = 'testHashPassword';
      jest
        .spyOn(utils, 'hashPassword')
        .mockImplementationOnce(() => hashPassword);
      await expect(service.hashPassword(password)).toBe(hashPassword);
      expect(utils.hashPassword).toHaveBeenCalledWith(password);
    });
  });

  describe(' getRolesFromMemberOf()', () => {
    it('should test getRolesFromMemberOf - Successfully', async () => {
      const memberOf: string[] = [
        'CN=C3Administrator,OU=Groups,DC=c3edu,DC=online',
        'CN=C3Teacher,OU=Groups,DC=c3edu,DC=online',
        'CN=C3Parent,OU=Groups,DC=c3edu,DC=online',
        'CN=C3Student,OU=Groups,DC=c3edu,DC=online',
        'CN=Domain Admins,CN=Users,DC=c3edu,DC=online',
      ];
      const result: string[] = ['C3_ADMINISTRATOR', 'C3_TEACHER', 'C3_PARENT', 'C3_STUDENT', 'DOMAIN_ADMINS'];
      await expect(service.getRolesFromMemberOf(memberOf)).toEqual(result);
    });

    it('should test getRolesFromMemberOf - memberOf length == 0', async () => {
      const memberOf: string[] = [];
      const result: string[] = [];
      await expect(service.getRolesFromMemberOf(memberOf)).toEqual(result);
    });

    it('should test getRolesFromMemberOf - memberOf != []', async () => {
      const memberOf: any = '';
      const result: string[] = [];
      await expect(service.getRolesFromMemberOf(memberOf)).toEqual(result);
    });

    it('should test getRolesFromMemberOf - memberOf undefined', async () => {
      const memberOf = undefined;
      const result: string[] = [];
      await expect(service.getRolesFromMemberOf(memberOf)).toEqual(result);
    });

    it('should test getRolesFromMemberOf - memberOf as string', async () => {
      const memberOf: any = 'CN=C3Administrator,OU=Groups,DC=c3edu,DC=online';
      const result: string[] = ['C3_ADMINISTRATOR'];
      await expect(service.getRolesFromMemberOf(memberOf)).toEqual(result);
    });

    it('should test getRolesFromMemberOf - invalid memberOf', async () => {
      const memberOf: any = 'test';
      const result: string[] = [undefined];
      await expect(service.getRolesFromMemberOf(memberOf)).toEqual(result);
    });
  });

});
