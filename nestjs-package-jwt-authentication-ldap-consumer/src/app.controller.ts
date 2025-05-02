// TODO: must be imported from interface
import { AuthService, CONFIG_SERVICE, CONSUMER_APP_SERVICE, ConsumerAppService, LdapService, ModuleOptionsConfig } from '@koakh/nestjs-package-jwt-authentication-ldap';
import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
// TODO: must be imported from service implementation and not from interface
// import { ConsumerAppService } from './consumer-app/consumer-app.service';
import { HashPasswordDto } from './dto';

@Controller()
export class AppController {

  constructor(
    // test local providers
    private readonly appService: AppService,
    // test package providers
    private readonly authService: AuthService,
    private readonly ldapService: LdapService,
    // injection tokens
    @Inject(CONFIG_SERVICE)
    private readonly config: ModuleOptionsConfig,
    // used here to check and test access to inject consumerAppService
    @Inject(CONSUMER_APP_SERVICE)
    private readonly consumerAppService: ConsumerAppService,
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

  // @Get('consumer/inject-metadata/:username')
  // async testConsumerAppServiceInjectMetadata(
  //   @Param('username') username: string,
  // ) {
  //   return { message: this.consumerAppService.injectMetadataCache(username) };
  // }

  @Post('hash-password')
  async testAuthServiceHashPassword(
    @Body() { password }: HashPasswordDto,
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
}
