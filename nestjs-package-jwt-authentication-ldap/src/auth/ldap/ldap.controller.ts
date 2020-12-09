import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Request, Response, SetMetadata, UseGuards } from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { JwtAuthGuard } from '../guards';
import { RolesAuthGuard } from '../guards/roles-auth.guard';
import { parseTemplate } from '../utils';
// tslint:disable-next-line: max-line-length
import { AddUserToGroupDto as AddMemberToGroupDto, ChangeUserRecordDto, CreateUserRecordDto, CacheResponseDto, SearchUserPaginatorResponseDto, SearchUserRecordResponseDto } from './dto';
import { constants as c } from './ldap.constants';
import { LdapService } from './ldap.service';
import { Roles as UserRoles } from '../enums';
@Controller('ldap')
export class LdapController {
  constructor(private readonly ldapService: LdapService) { }
  @Post('/user')
  // @Roles and @UseGuards(RolesAuthGuard) require to be before @UseGuards(JwtAuthGuard) else we don't have jwt user injected
  @Roles(UserRoles.C3_ADMINISTRATOR)
  @UseGuards(RolesAuthGuard)
  @UseGuards(JwtAuthGuard)
  async createUserRecord(
    @Request() req,
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
        res.status(HttpStatus.BAD_REQUEST).send({ error: (error.message) ? error.message : error });
      });
  }

  // TODO must have ROLE_ADMIN, use Guards
  @Post('/group/add-member')
  @Roles(UserRoles.C3_ADMINISTRATOR)
  @UseGuards(RolesAuthGuard)
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
        res.status(HttpStatus.BAD_REQUEST).send({ error: (error.message) ? error.message : error });
      });
  }

  // TODO must have ROLE_ADMIN, use Guards
  @Get('/user/:username')
  @Roles(UserRoles.C3_ADMINISTRATOR)
  @UseGuards(RolesAuthGuard)
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
        res.status(HttpStatus.BAD_REQUEST).send({ error: (error.message) ? error.message : error });
      });
  }

  // TODO must have ROLE_ADMIN, use Guards
  @Post('/cache/init')
  @Roles(UserRoles.C3_ADMINISTRATOR)
  @UseGuards(RolesAuthGuard)
  @UseGuards(JwtAuthGuard)
  async initUserRecordsCache(
    @Response() res
  ): Promise<void> {
    this.ldapService.initUserRecordsCache()
      .then((dto: CacheResponseDto) => {
        res.status(HttpStatus.CREATED).send(dto);
      })
      .catch((error) => {
        res.status(HttpStatus.BAD_REQUEST).send({ error: (error.message) ? error.message : error });
      });
  }

  // TODO must have ROLE_ADMIN, use Guards
  @Get('/user')
  @Roles(UserRoles.C3_ADMINISTRATOR)
  @UseGuards(RolesAuthGuard)
  @UseGuards(JwtAuthGuard)
  async getUserRecords(
    @Response() userRecordsResponse,
  ): Promise<void> {
    this.ldapService.getUserRecords()
      .then((dto: SearchUserPaginatorResponseDto) => {
        userRecordsResponse.status(HttpStatus.CREATED).send(dto);
      })
      .catch((error) => {
        userRecordsResponse.status(HttpStatus.BAD_REQUEST).send({ error: (error.message) ? error.message : error });
      });
  }

  // TODO must have ROLE_ADMIN, use Guards
  @Delete('/user/:username')
  @Roles(UserRoles.C3_ADMINISTRATOR)
  @UseGuards(RolesAuthGuard)
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
        res.status(HttpStatus.BAD_REQUEST).send({ error: (error.message) ? error.message : error });
      });
  }

  // TODO must have ROLE_ADMIN, use Guards
  @Put('/user/:username')
  @Roles(UserRoles.C3_ADMINISTRATOR)
  @UseGuards(RolesAuthGuard)
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
        res.status(HttpStatus.BAD_REQUEST).send({ error: (error.message) ? error.message : error });
      });
  }
}
