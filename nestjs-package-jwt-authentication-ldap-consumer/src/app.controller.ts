import { AuthService, CONFIG_SERVICE, LdapService, ModuleOptionsConfig } from '@koakh/nestjs-package-jwt-authentication-ldap';
import { Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ConsumerAppService } from './consumer-app/consumer-app.service';
import { HashPasswordDto } from './dto';

@Controller()
export class AppController {

  constructor(
    // test local providers
    private readonly appService: AppService,
    private readonly consumerAppService: ConsumerAppService,
    // test package providers
    private readonly authService: AuthService,
    private readonly ldapService: LdapService,
    // injection tokens
    @Inject(CONFIG_SERVICE)
    private readonly config: ModuleOptionsConfig,
  ) { }

  @Get('app/:username')
  async testAppServiceGetWelcome(
    @Param('username') username: string,
  ) {
    return { message: this.appService.getWelcome(username) };
  }

  @Get('consumer/:username')
  async testConsumerAppServiceGetWelcome(
    @Param('username') username: string,
  ) {
    return { message: this.consumerAppService.getWelcome(username) };
  }

  @Post('hash-password')
  async testAuthServiceHashPassword(
    @Body() { password }: HashPasswordDto
  ) {
    return { message: this.authService.hashPassword(password) };
  }

  @Get('user/:username')
  async testLdapServiceGetUserRecord(
    @Param('username') username: string,
  ) {
    return await this.ldapService.getUserRecord(username);
  }

  @Get('config/:section')
  async testConfigService(
    @Param('section') section: string,
  ) {
    return await this.config[section];
  }

  // @Post('jwt-sign')
  // async testJwtServiceSign(
  //   @Body() payload: any
  // ) {
  //   return { accessToken: this.jwtService.sign(payload) };
  // }
};
