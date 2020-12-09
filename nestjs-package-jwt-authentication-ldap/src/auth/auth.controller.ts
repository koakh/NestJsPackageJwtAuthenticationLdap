import { Body, Controller, HttpStatus, Logger, Post, Req, Request, Response, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as passport from 'passport';
import { envConstants } from '../common/constants/env';
import { AuthService } from './auth.service';
import { RevokeRefreshTokenDto, SignJwtTokenDto } from './dto';
import { JwtAuthGuard, LdapAuthGuard } from './guards';
import AccessToken from './interfaces/access-token.interface';
import { JwtResponsePayload } from './interfaces/jwt-response-payload.interface';
import { LoginRequestDto, LoginResponseDto, SearchUserRecordResponseDto } from './ldap/dto';
import { LdapService } from './ldap/ldap.service';

/**
 * Note: "tokenVersion" in in authToken, not in refreshToken, check it in sent cookie, after refreshToken
 */

@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly ldapService: LdapService,
  ) { }
  @Post('/login')
  @UseGuards(LdapAuthGuard)
  async login(
    @Req() req: LoginRequestDto,
    @Response() res,
  ): Promise<LoginResponseDto> {
    // authenticate user
    passport.authenticate('ldap', { session: false });
    // destruct
    const { user: { cn: username, userPrincipalName: email, dn: userId, memberOf } } = req;
    const roles = (memberOf)
      // check roles to prevent crash
      ? this.authService.getRolesFromMemberOf(memberOf)
      : [];
    // payload for accessToken
    const signJwtTokenDto: SignJwtTokenDto = { username, userId, roles };
    const { accessToken } = await this.authService.signJwtToken(signJwtTokenDto);
    // get incremented tokenVersion
    const tokenVersion = this.authService.usersStore.incrementTokenVersion(username);
    // refreshToken
    const refreshToken: AccessToken = await this.authService.signRefreshToken(signJwtTokenDto, tokenVersion);
    // send jid cookie refresh token to client (browser, insomnia etc)
    this.authService.sendRefreshToken(res, refreshToken);
    // don't delete sensitive properties here, this is a reference to moke user data
    // if we delete password, we deleted it from moke user
    // return LoginUserResponseDto
    return res.send({ user: { id: userId, username, email, roles }, accessToken });
  }

  /**
   * consumer.apply(CookieParserMiddleware).forRoutes, else cookie is undefined
   */
  @Post('/refresh-token')
  async ldapRefreshToken(
    @Request() req,
    @Response() res,
  ): Promise<AccessToken> {
    let payload: JwtResponsePayload;
    // Logger.log(`headers ${JSON.stringify(req.headers, undefined, 2)}`, AuthController.name);
    // Logger.log(`cookies ${JSON.stringify(req.cookies, undefined, 2)}`, AuthController.name);
    // inner function
    const invalidPayload = () => res.status(HttpStatus.UNAUTHORIZED).send({ valid: false, accessToken: '' });
    // get jid token from cookies
    const token: string = (req.cookies && req.cookies.jid) ? req.cookies.jid : null;
    // check if jid token is present
    if (!token) {
      return invalidPayload();
    }

    try {
      // Logger.log(`refreshTokenJwtSecret: '${this.configService.get(envConstants.REFRESH_TOKEN_JWT_SECRET)}'`, AuthController.name);
      payload = this.jwtService.verify(token, { secret: this.configService.get(envConstants.REFRESH_TOKEN_JWT_SECRET) });
    } catch (error) {
      Logger.error(error, AuthController.name);
      return invalidPayload();
    }

    // user from ldapService
    const { user }: SearchUserRecordResponseDto = await this.ldapService.getUserRecord(payload.username);
    const roles = this.authService.getRolesFromMemberOf(user.memberOf);
    // check jid token
    if (!user) {
      return invalidPayload();
    }

    // accessToken: add some user data to it, like id and roles
    const signJwtTokenDto: SignJwtTokenDto = { username: user.username, userId: user.dn, roles };
    const { accessToken }: AccessToken = await this.authService.signJwtToken(signJwtTokenDto);

    // check inMemory tokenVersion, must be equal to inMemory else is considered invalid token
    const tokenVersion: number = this.authService.usersStore.getTokenVersion(user.username);
    if (tokenVersion !== payload.tokenVersion) {
      return invalidPayload();
    }

    // we don't increment tokenVersion here, only when we login, this way refreshToken is always valid until we login again
    const refreshToken: AccessToken = await this.authService.signRefreshToken(signJwtTokenDto, tokenVersion);
    // send refreshToken in response/setCookie
    this.authService.sendRefreshToken(res, refreshToken);
    res.send({ valid: true, accessToken });
  }

  // Don't expose this resolver, only used in development environments
  @Post('/revoke-refresh-token')
  async revokeUserRefreshToken(
    @Body('username') username: string,
  ): Promise<RevokeRefreshTokenDto> {
    // invalidate user tokens increasing tokenVersion, this way last tokenVersion of refreshToken will be invalidate
    // when user tries to use it in /refresh-token and current version is greater than refreshToken.tokenVersion
    const version = this.authService.usersStore.incrementTokenVersion(username);
    return { version };
  }

  @Post('/logout')
  @UseGuards(JwtAuthGuard)
  async logOut(
    @Response() res
  ): Promise<void> {
    // send empty refreshToken, with same name jid, etc, better than res.clearCookie
    // this will invalidate the browser cookie refreshToken, only work with browser, not with insomnia etc
    this.authService.sendRefreshToken(res, { accessToken: '' });
    return res.send({ logOut: true });
  }
}
