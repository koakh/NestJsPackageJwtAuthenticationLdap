import { Body, Controller, HttpStatus, Logger, Post, Req, Request, Response, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as passport from 'passport';
import { envConstants } from '../common/constants/env';
import { LoginUserDto } from '../user/dtos';
import { User } from '../user/models';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { LdapLoginRequestDto, LdapLoginResponseDto, LdapSearchUsernameDto, RevokeRefreshTokenDto, SignJwtTokenDto } from './dto';
import { JwtAuthGuard, LdapAuthGuard } from './guards';
import { LocalAuthGuard } from './guards/local-auth.guard';
import AccessToken from './interfaces/access-token';
import { JwtResponsePayload } from './interfaces/jwt-response.payload';
import { LdapService } from './ldap.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly ldapService: LdapService,
  ) { }
  @Post('login-ldap')
  @UseGuards(LdapAuthGuard)
  async ldapLogin(
    @Req() req: LdapLoginRequestDto,
    @Response() res,
  ): Promise<LdapLoginResponseDto> {
    // authenticate user
    passport.authenticate('ldap', { session: false });
    // destruct
    const { user: { cn: username, userPrincipalName: email, distinguishedName: userId, memberOf } } = req;
    const roles = this.authService.getRolesFromMemberOf(memberOf);
    const metaData = { key: 'value' };
    // payload for accessToken
    const signJwtTokenDto: SignJwtTokenDto = { username, userId, roles };
    const { accessToken } = await this.authService.signJwtToken(signJwtTokenDto);
    // get incremented tokenVersion
    const tokenVersion = this.userService.usersStore.incrementTokenVersion(username);
    // refreshToken
    const refreshToken: AccessToken = await this.authService.signRefreshToken(signJwtTokenDto, tokenVersion);
    // send jid cookie refresh token to client (browser, insomnia etc)
    this.authService.sendRefreshToken(res, refreshToken);
    // don't delete sensitive properties here, this is a reference to moke user data
    // if we delete password, we deleted it from moke user
    // return LoginUserResponseDto
    return res.send({ user: { username, email, roles, metaData }, accessToken });
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async logIn(
    @Response() res,
    @Body() loginUserDto: LoginUserDto,
  ): Promise<any> {
    // get user
    const user: User = await this.userService.findOneByUsername(loginUserDto.username);
    // accessToken: add some user data to it, like id and roles
    const signJwtTokenDto = { ...loginUserDto, userId: user.id, roles: user.roles };
    const { accessToken } = await this.authService.signJwtToken(signJwtTokenDto);
    // get incremented tokenVersion
    const tokenVersion = this.userService.usersStore.incrementTokenVersion(loginUserDto.username);
    // refreshToken
    const refreshToken: AccessToken = await this.authService.signRefreshToken(signJwtTokenDto, tokenVersion);
    // send jid cookie refresh token to client (browser, insomnia etc)
    this.authService.sendRefreshToken(res, refreshToken);
    // don't delete sensitive properties here, this is a reference to moke user data
    // if we delete password, we deleted it from moke user
    // return LoginUserResponseDto
    const returnUser = { ...user, password: undefined };
    return res.send({ user: returnUser, accessToken });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logOut(
    @Response() res
  ): Promise<void> {
    // send empty refreshToken, with same name jid, etc, better than res.clearCookie
    // this will invalidate the browser cookie refreshToken, only work with browser, not with insomnia etc
    this.authService.sendRefreshToken(res, { accessToken: '' });
    return res.send({ logOut: true });
  }

  @Post('/refresh-token')
  async refreshToken(
    @Request() req,
    @Response() res,
  ): Promise<AccessToken> {
    debugger;
    Logger.log(`headers ${JSON.stringify(req.headers, undefined, 2)}`, AuthController.name);
    Logger.log(`cookies ${JSON.stringify(req.cookies, undefined, 2)}`, AuthController.name);
    // inner function
    const invalidPayload = () => res.status(HttpStatus.UNAUTHORIZED).send({ valid: false, accessToken: '' });
    // get jid token from cookies
    const token: string = (req.cookies && req.cookies.jid) ? req.cookies.jid : null;
    // check if jid token is present
    if (!token) {
      return invalidPayload();
    }

    let payload: JwtResponsePayload;
    try {
      // Logger.log(`refreshTokenJwtSecret: '${this.configService.get(envConstants.REFRESH_TOKEN_JWT_SECRET)}'`, AuthController.name);
      payload = this.jwtService.verify(token, { secret: this.configService.get(envConstants.REFRESH_TOKEN_JWT_SECRET) });
    } catch (error) {
      Logger.error(error, AuthController.name);
      return invalidPayload();
    }

    // token is valid, send back accessToken
    // TODO: remove old userService
    // const { user }: LdapSearchUsernameDto = await this.ldapService.getUserRecord(payload.username);

    const user: User = await this.userService.findOneByUsername(payload.username);
    // destruct
    // TODO: get user from old jwt payload
    // const { user: { cn: username, userPrincipalName: email, distinguishedName: userId, memberOf } } = payload;
    Logger.log(`user:${JSON.stringify(user, undefined, 2)}`, AuthController.name);
    Logger.log(`payload:${JSON.stringify(payload, undefined, 2)}`, AuthController.name);
    // check jid token
    if (!user) {
      return invalidPayload();
    }

    // check inMemory tokenVersion
    const tokenVersion: number = this.userService.usersStore.getTokenVersion(user.username);
    if (tokenVersion !== payload.tokenVersion) {
      return invalidPayload();
    }

    // refresh the refreshToken on accessToken, this way we extended/reset refreshToken validity to default value
    // TODO: password here ????
    const loginUserDto: LoginUserDto = { username: user.username, password: user.password };
    // we don't increment tokenVersion here, only when we login, this way refreshToken is always valid until we login again
    // TODO: loginUserDto here ????
    const refreshToken: AccessToken = await this.authService.signRefreshToken(loginUserDto, tokenVersion);
    // const refreshToken: AccessToken = await this.authService.signRefreshToken(user, tokenVersion);
    // send refreshToken in response/setCookie
    this.authService.sendRefreshToken(res, refreshToken);

    const { accessToken }: AccessToken = await this.authService.signJwtToken(user);
    res.send({ valid: true, accessToken });
  }

  // Don't expose this resolver, only used in development environments
  @Post('/revoke-refresh-token')
  async revokeUserRefreshToken(
    @Body('username') username: string,
  ): Promise<RevokeRefreshTokenDto> {
    // invalidate user tokens increasing tokenVersion, this way last tokenVersion of refreshToken will be invalidate
    // when user tries to use it in /refresh-token and current version is greater than refreshToken.tokenVersion
    const version = this.userService.usersStore.incrementTokenVersion(username);
    return { version };
  }
}
