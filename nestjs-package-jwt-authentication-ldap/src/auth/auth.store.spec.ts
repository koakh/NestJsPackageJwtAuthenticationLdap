import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { AuthStore } from './auth.store';
import { mockedConfigService } from './utils/mocks/config.service';

describe('AuthStore', () => {
  let authStore: AuthStore;
  let configService: ConfigService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthStore],
      providers: [
        {
          provide: ConfigService,
          useValue: mockedConfigService,
        },
      ],
    }).compile();

    authStore = moduleRef.get<AuthStore>(AuthStore);
    configService = moduleRef.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(authStore).toBeDefined();
  });

  describe('addUser function', () => {

    it('addUser - Error', () => {
      const username = undefined;
      try {
        authStore.addUser(username, 0);
      } catch (err) {
        expect(err.message).toEqual('invalid username');
      }
    })

    it('addUser - Successfully', () => {
      const username = 'c3';
      const result = { username: 'c3', tokenVersion: 0 }
      expect(authStore.addUser(username, 0)).toStrictEqual(result);
    });
  })

  describe('getUser function', () => {
    const username = 'c3';
    it('getUser - Successfully', () => {
      const spyUser = { username, tokenVersion: 0 };
      jest.spyOn(authStore, 'addUser')
        .mockImplementationOnce(() => spyUser)
      expect(authStore.getUser(username)).toStrictEqual(spyUser);
    });
  })

  describe('getTokenVersion function', () => {
    const username = 'c3';
    it('getTokenVersion - Successfully', () => {
      const spyUser = { username, tokenVersion: 2 };
      jest.spyOn(authStore, 'getUser')
        .mockImplementationOnce(() => spyUser)
      expect(authStore.getTokenVersion(username)).toBe(spyUser.tokenVersion);
    });
  })

  describe('incrementTokenVersion function', () => {
    it(`incrementTokenVersion (don't increment tokenVersion) - Successfully`, () => {
      const newAuthStore = new AuthStore(configService);
      const spyUser = {
        username: 'c3',
        tokenVersion: 0,
      };
      const result = 'true';
      jest
        .spyOn(authStore, 'getUser')
        .mockImplementationOnce(() => spyUser);
      const token = newAuthStore.incrementTokenVersion(spyUser.username);
      expect(token).toBe(0);
    })

    it('incrementTokenVersion (increment tokenVersion) - Successfully', () => {
      configService.get = jest.fn(() => 'false');
      const newAuthStore = new AuthStore(configService);
      const spyUser = {
        username: 'c3',
        tokenVersion: 0,
      };
      jest
        .spyOn(authStore, 'getUser')
        .mockImplementationOnce(() => spyUser);
      const token = newAuthStore.incrementTokenVersion(spyUser.username);
      expect(token).toBe(1);
    })
  })
});
