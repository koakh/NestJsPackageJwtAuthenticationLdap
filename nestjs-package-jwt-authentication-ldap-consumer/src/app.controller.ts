import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { CreateCatDto } from './dto';
@Controller()
export class AppController {

  constructor(
    private readonly appService: AppService,
  ) { }

  // sample: test debugger consumer app with `curl http://localhost:3010/v1`
  // @Get()
  // @ApiOkResponse({ description: 'The request has succeeded' })
  // hashPassword(): string {
  //   debugger;
  //   const password = 'some fake data';
  //   return this.appService.hashPassword(password);
  // }

  // sample
  // @Post()
  // @ApiCreatedResponse({ description: 'Content Created' })
  // async create(@Body() createCatDto: CreateCatDto) {
  //   return { message: `hello ${createCatDto.name}` };
  // }
};