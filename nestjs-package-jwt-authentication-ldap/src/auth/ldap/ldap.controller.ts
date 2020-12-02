import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Response, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards';
import { parseTemplate } from '../utils';
import { AddUserToGroupDto as AddMemberToGroupDto, ChangeUserRecordDto, CreateUserRecordDto as CreateUserRecordDto, SearchUserRecordResponseDto } from './dto';
import { constants as c } from './ldap.constants';
import { LdapService } from './ldap.service';

@Controller('ldap')
export class LdapController {

  constructor(private readonly ldapService: LdapService) { }
  // TODO must have ROLE_ADMIN, use Guards
  @Post('/user')
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
        res.status(HttpStatus.BAD_REQUEST).send({error: (error.message) ? error.message : error});
      });
  }

  // TODO must have ROLE_ADMIN, use Guards
  @Post('/group/add-member')
  @UseGuards(JwtAuthGuard)
  async addMemberToGroup(
    @Response() res,
    @Body() addUserToGroupDto: AddMemberToGroupDto,
  ): Promise<void> {
    this.ldapService.addUserToGroup(addUserToGroupDto)
      .then(() => {
        res.status(HttpStatus.CREATED).send({
          message: parseTemplate(c.USER_ADDED_TO_GROUP, addUserToGroupDto)
        });
      })
      .catch((error) => {
        res.status(HttpStatus.BAD_REQUEST).send({error: (error.message) ? error.message : error});
      });
  }

  // TODO must have ROLE_ADMIN, use Guards
  @Get('/user/:username')
  @UseGuards(JwtAuthGuard)
  async getUserRecord(
    @Response() res,
    @Param('username') username: string,
  ): Promise<void> {
    this.ldapService.getUserRecord(username)
      .then((user: SearchUserRecordResponseDto) => {
        res.status(HttpStatus.CREATED).send(user);
      })
      .catch((error) => {
        res.status(HttpStatus.BAD_REQUEST).send({error: (error.message) ? error.message : error});
      });
  }

  // TODO must have ROLE_ADMIN, use Guards
  @Delete('/user/:username')
  @UseGuards(JwtAuthGuard)
  async deleteUserRecord(
    @Response() res,
    @Param('username') username: string,
  ): Promise<void> {
    this.ldapService.deleteUserRecord(username)
      .then(() => {
        res.status(HttpStatus.NO_CONTENT).send();
      })
      .catch((error) => {
        res.status(HttpStatus.BAD_REQUEST).send({error: (error.message) ? error.message : error});
      });
  }

  // TODO must have ROLE_ADMIN, use Guards
  @Put('/user/:username')
  @UseGuards(JwtAuthGuard)
  async changeUserRecord(
    @Response() res,
    @Param('username') username: string,
    @Body() changeUserRecordDto: ChangeUserRecordDto,
  ): Promise<void> {
    this.ldapService.changeUserRecord(username, changeUserRecordDto)
      .then(() => {
        res.status(HttpStatus.NO_CONTENT).send();
      })
      .catch((error) => {
        res.status(HttpStatus.BAD_REQUEST).send({error: (error.message) ? error.message : error});
      });
  }
}
