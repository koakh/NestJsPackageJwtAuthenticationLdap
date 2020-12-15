import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { CreateCatDto } from './dto';
@Controller()
export class AppController {

  constructor(
    private readonly appService: AppService,
  ) { }

  // sample
  // @Get()
  // @ApiOkResponse({ description: 'The request has succeeded' })
  // hashPassword(): string {
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