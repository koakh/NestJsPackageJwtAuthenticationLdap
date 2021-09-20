import { ConsumerAppService } from '@koakh/nestjs-package-jwt-authentication-ldap';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { HashPasswordDto } from './dto';
@Controller()
export class AppController {

  constructor(
    private readonly appService: AppService,
    // private readonly consumerAppService: ConsumerAppService,
  ) { }

  @Post('hash-password')
  async hashPassword(@Body() { password }: HashPasswordDto) {
    return { message: this.appService.hashPassword(password) };
  }

  // @Get('welcome/:username')
  // async testConsumerAppService(
  //   @Param('username') username: string,
  // ) {
  //   return { message: this.consumerAppService.getWelcome(username) };
  // }  
};
