import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {

  constructor(
    private readonly appService: AppService,
  ) { }

  @Get()
  hashPassword(): string {
    const password = 'some fake data';
    return this.appService.hashPassword(password);
  }
};
