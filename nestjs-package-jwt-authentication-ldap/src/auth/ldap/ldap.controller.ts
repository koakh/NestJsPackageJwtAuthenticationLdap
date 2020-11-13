import { Body, Controller, Get, HttpStatus, Post, Response, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards';
import { parseTemplate } from '../utils';
import { AddUserToGroupDto, CreateLdapUserDto as CreateUserRecordDto } from './dto';
import { constants as c } from './ldap.constants';
import { LdapService } from './ldap.service';

@Controller('ldap')
export class LdapController {

  constructor(private readonly ldapService: LdapService) { }

  @Get(':skip/:take')
  @UseGuards(JwtAuthGuard)
  greeting(): { [key: string]: string } {
    return { message: 'hello from ldap' };
  }

  // TODO must have ROLE_ADMIN, use Guards
  @Post('user')
  @UseGuards(JwtAuthGuard)
  async createUserRecord(
    @Response() res,
    @Body() createLdapUserDto: CreateUserRecordDto,
  ): Promise<void> {
    this.ldapService.createUserRecord(createLdapUserDto)
      .then(() => {
        res.status(HttpStatus.CREATED).send({
          message: parseTemplate(c.USER_CREATED, createLdapUserDto), user: {
            // remove password from response
            ...createLdapUserDto, password: undefined
          }
        });
      })
      .catch((error) => {
        res.status(HttpStatus.CONFLICT).send(error);
      });
  }

  // TODO must have ROLE_ADMIN, use Guards
  @Post('group/add-member')
  @UseGuards(JwtAuthGuard)
  async addUserToGroup(
    @Response() res,
    @Body() addUserToGroupDto: AddUserToGroupDto,
  ): Promise<void> {
    this.ldapService.addUserToGroup(addUserToGroupDto)
      .then(() => {
        res.status(HttpStatus.CREATED).send({
          message: parseTemplate(c.USER_ADDED_TO_GROUP, addUserToGroupDto), user: {
            // remove password from response
            ...addUserToGroupDto, password: undefined
          }
        });
      })
      .catch((error) => {
        res.status(HttpStatus.CONFLICT).send(error);
      });
  }
}

