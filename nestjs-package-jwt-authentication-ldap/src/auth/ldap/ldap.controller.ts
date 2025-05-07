import { Body, Controller, Delete, Get, HttpStatus, Logger, NotFoundException, Param, Post, Put, Request, Response, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { config } from 'dotenv';
import { Roles, Permissions } from '../decorators';
import { UserRoles } from '../enums';
import { JwtAuthGuard, PermissionsAuthGuard } from '../guards';
import { parseTemplate } from '../utils';
import { AddOrDeleteUserToGroupDto, CacheResponseDto, ChangeDefaultGroupDto, ChangeUserPasswordDto, ChangeUserProfileDto, ChangeUserRecordDto, CreateGroupRecordDto, CreateUserRecordDto, DeleteGroupRecordDto, DeleteUserRecordDto, SearchGroupRecordResponseDto, SearchUserPaginatorResponseDto, SearchUserRecordResponseDto, SearchUserRecordsDto } from './dto';
import { ChangeUserRecordOperation, GroupTypeOu, UpdateCacheOperation } from './enums';
import { LdapDeleteUsersGuard, LdapUpdateUsersGuard } from './guards';
import { constants as c } from './ldap.constants';
import { LdapService } from './ldap.service';

config();

// https://claude.ai/chat/01aaff81-c4c4-46c1-8408-a24432c89b77
// in nestjs 10 we need to use constants, else we don't have access to process.env.LDAP_CONTROLLER_PERMISSION_GET_USER in @Permissions(process.env.LDAP_CONTROLLER_PERMISSION_GET_USER)
const GET_USER = process.env.LDAP_CONTROLLER_PERMISSION_GET_USER || 'RP_USERS,RP_USERS@READ';
const GET_USERS = process.env.LDAP_CONTROLLER_PERMISSION_GET_USERS || 'RP_USERS,RP_USERS@READ';
const AUTH_ADMIN_ROLE = process.env.AUTH_ADMIN_ROLE || UserRoles.ROLE_ADMIN;

@Controller('ldap')
@ApiTags('ldap')
@ApiBearerAuth()
export class LdapController {
  constructor(private readonly ldapService: LdapService) { }

  // helper method to check valid logged user
  checkAuthUser(req: Request) {
    if (!(req as any).user || !(req as any).user.username) {
      throw new NotFoundException('invalid authenticated user');
    }
  }

  @Post('/user')
  // @Roles and // @UseGuards(PermissionsAuthGuard) require to be before @UseGuards(JwtAuthGuard) else we don't have jwt user injected
  @Roles(AUTH_ADMIN_ROLE)
  @UseGuards(PermissionsAuthGuard)
  @UseGuards(JwtAuthGuard)
  async createUserRecord(
    @Response() res,
    @Body() createLdapUserDto: CreateUserRecordDto,
  ): Promise<void> {
    this.ldapService.createUserRecord(createLdapUserDto)
      .then((username: string) => {
        res.status(HttpStatus.CREATED).send({
          message: parseTemplate(c.USER_CREATED, { username }), user: {
            // remove password from response
            ...createLdapUserDto, username, password: undefined,
          },
        });
      })
      .catch((error) => {
        res.status(HttpStatus.BAD_REQUEST).send({ error: (error.message) ? error.message : error });
      });
  }

  @Post('/group/:operation')
  @Roles(AUTH_ADMIN_ROLE)
  @UseGuards(PermissionsAuthGuard)
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'operation', enum: ['add', 'delete'] })
  async addMemberToGroup(
    @Response() res,
    @Param('operation') operation: ChangeUserRecordOperation,
    @Body() addUserToGroupDto: AddOrDeleteUserToGroupDto,
  ): Promise<void> {
    this.ldapService.addOrDeleteUserToGroup(operation, addUserToGroupDto)
      .then(() => {
        res.status(HttpStatus.CREATED).send({
          message: parseTemplate(c.USER_ADDED_DELETED_TO_GROUP, { operation, ...addUserToGroupDto }),
        });
      })
      .catch((error) => {
        res.status(HttpStatus.BAD_REQUEST).send({ error: (error.message) ? error.message : error });
      });
  }

  @Put('/default-group')
  @Roles(AUTH_ADMIN_ROLE)
  @UseGuards(PermissionsAuthGuard)
  @UseGuards(JwtAuthGuard)
  async updateDefaultGroup(
    @Response() res,
    @Body() changeDefaultGroupDto: ChangeDefaultGroupDto,
  ): Promise<void> {
    this.ldapService.updateDefaultGroup(changeDefaultGroupDto)
      .then(() => {
        res.status(HttpStatus.NO_CONTENT).send();
      })
      .catch((error) => {
        res.status(HttpStatus.BAD_REQUEST).send({ error: (error.message) ? error.message : error });
      });
  }

  @Get('/user/:username')
  @Roles(AUTH_ADMIN_ROLE)
  @Permissions(GET_USER)
  @UseGuards(PermissionsAuthGuard)
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

  @Post('/cache/init')
  @Roles(AUTH_ADMIN_ROLE)
  @UseGuards(PermissionsAuthGuard)
  @UseGuards(JwtAuthGuard)
  async initUserRecordsCache(
    @Response() res,
    @Body() payload: { filter: string },
  ): Promise<void> {
    this.ldapService.initUserRecordsCache(payload.filter)
      .then((dto: CacheResponseDto) => {
        res.status(HttpStatus.CREATED).send(dto);
      })
      .catch((error) => {
        res.status(HttpStatus.BAD_REQUEST).send({ error: (error.message) ? error.message : error });
      });
  }

  @Post('/cache/update')
  @Roles(AUTH_ADMIN_ROLE)
  @UseGuards(JwtAuthGuard)
  async updateUserRecordsCache(
    @Response() res,
    @Body() payload: string[],
  ): Promise<void> {
    for (const item of payload) {
      this.ldapService.updateCachedUser(UpdateCacheOperation.CREATE, item).catch((error) => {
        res.status(HttpStatus.BAD_REQUEST).send({ error: error.message ? error.message : error });
      });
    }
    res.status(HttpStatus.CREATED).send({});
  }

  @Post('/cache/search')
  @Roles(AUTH_ADMIN_ROLE)
  @Permissions(GET_USERS)
  @UseGuards(PermissionsAuthGuard)
  @UseGuards(JwtAuthGuard)
  async getUserRecords(
    @Response() userRecordsResponse,
    @Body() searchUserRecordsDto: SearchUserRecordsDto,
  ): Promise<void> {
    this.ldapService.getUserRecords(searchUserRecordsDto)
      .then((dto: SearchUserPaginatorResponseDto) => {
        userRecordsResponse.status(HttpStatus.CREATED).send(dto);
      })
      .catch((error) => {
        userRecordsResponse.status(HttpStatus.BAD_REQUEST).send({ error: (error.message) ? error.message : error });
      });
  }

  @Delete('/user')
  @Roles(AUTH_ADMIN_ROLE)
  @UseGuards(LdapDeleteUsersGuard)
  @UseGuards(PermissionsAuthGuard)
  @UseGuards(JwtAuthGuard)
  async deleteUserRecord(
    @Response() res,
    @Body() deleteUserRecordDto: DeleteUserRecordDto,
  ): Promise<void> {
    this.ldapService.deleteUserRecord(deleteUserRecordDto)
      .then(() => {
        res.status(HttpStatus.NO_CONTENT).send();
      })
      .catch((error) => {
        res.status(HttpStatus.BAD_REQUEST).send({ error: (error.message) ? error.message : error });
      });
  }

  @Put('/user')
  @Roles(AUTH_ADMIN_ROLE)
  @UseGuards(PermissionsAuthGuard)
  @UseGuards(JwtAuthGuard)
  async changeUserRecord(
    @Response() res,
    @Body() changeUserRecordDto: ChangeUserRecordDto,
  ): Promise<any> {
    this.ldapService.changeUserRecord(changeUserRecordDto)
      .then(() => {
        res.status(HttpStatus.NO_CONTENT).send();
      })
      .catch((error) => {
        // res.status(HttpStatus.BAD_REQUEST).send({ error: error.message ? error.message : error.validation ? error.validation : error });
        res.status(HttpStatus.BAD_REQUEST).send({ error: error.message ? error.message : error });
      });
  }

  // Owner

  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  async getUserProfileRecord(
    @Request() req,
    @Response() res,
  ): Promise<void> {
    this.checkAuthUser(req);
    this.ldapService.getUserRecord(req.user.username)
      .then((user: SearchUserRecordResponseDto) => {
        res.status(HttpStatus.CREATED).send(user);
      })
      .catch((error) => {
        res.status(HttpStatus.BAD_REQUEST).send({ error: (error.message) ? error.message : error });
      });
  }

  @Put('/profile')
  // see permittedKeys = ['givenName', 'sn', 'displayName', 'mail', 'telephoneNumber' ];
  @UseGuards(LdapUpdateUsersGuard)
  @UseGuards(JwtAuthGuard)
  async changeUserProfileRecord(
    @Request() req,
    @Response() res,
    @Body() changeUserProfileDto: ChangeUserProfileDto,
  ): Promise<void> {
    this.checkAuthUser(req);
    // convert ChangeUserProfileDto into ChangeUserRecordDto with injected user and pass to changeUserRecord
    this.ldapService.changeUserRecord({ ...changeUserProfileDto, cn: req.user.username })
      .then(() => {
        Logger.log(`changed user profile record: '${req.user.username}'`, LdapController.name);
        res.status(HttpStatus.NO_CONTENT).send();
      })
      .catch((error) => {
        res.status(HttpStatus.BAD_REQUEST).send({ error: (error.message) ? error.message : error });
      });
  }

  @Put('/profile/password')
  @UseGuards(LdapUpdateUsersGuard)
  @UseGuards(JwtAuthGuard)
  async changeUserProfilePassword(
    @Request() req,
    @Response() res,
    @Body() changeUserPasswordDto: ChangeUserPasswordDto,
  ): Promise<void> {
    this.checkAuthUser(req);
    this.ldapService.changeUserProfilePassword(req.user.username, changeUserPasswordDto)
      .then(() => {
        res.status(HttpStatus.NO_CONTENT).send();
      })
      .catch((error) => {
        res.status(HttpStatus.BAD_REQUEST).send({ error: (error.message) ? error.message : error });
      });
  }

  @Post('/group')
  @Roles(AUTH_ADMIN_ROLE)
  @UseGuards(PermissionsAuthGuard)
  @UseGuards(JwtAuthGuard)
  async createGroupRecord(
    @Response() res,
    @Body() createLdapGroupDto: CreateGroupRecordDto,
  ): Promise<void> {
    this.ldapService.createGroupRecord(createLdapGroupDto)
      .then((groupName: string) => {
        res.status(HttpStatus.CREATED).send({
          message: parseTemplate(c.GROUP_CREATED, { groupName }), group: {
            groupName,
          },
        });
      })
      .catch((error) => {
        res.status(HttpStatus.BAD_REQUEST).send({ error: (error.message) ? error.message : error });
      });
  }

  @Delete('/group')
  @Roles(AUTH_ADMIN_ROLE)
  @UseGuards(PermissionsAuthGuard)
  @UseGuards(JwtAuthGuard)
  async deleteGroupRecord(
    @Response() res,
    @Body() deleteGroupRecordDto: DeleteGroupRecordDto,
  ): Promise<void> {
    this.ldapService.deleteGroupRecord(deleteGroupRecordDto)
      .then(() => {
        res.status(HttpStatus.NO_CONTENT).send();
      })
      .catch((error) => {
        res.status(HttpStatus.BAD_REQUEST).send({ error: (error.message) ? error.message : error });
      });
  }

  @Get('/group')
  @Roles(AUTH_ADMIN_ROLE)
  @UseGuards(PermissionsAuthGuard)
  @UseGuards(JwtAuthGuard)
  async getGroupRecordWithoutParam(
    @Response() res,
  ) {
    return this.getGroupRecord(res, undefined);
  }

  @Get('/group/:groupName')
  @ApiParam({ name: 'groupName', type: 'string' })
  @Roles(AUTH_ADMIN_ROLE)
  @UseGuards(PermissionsAuthGuard)
  @UseGuards(JwtAuthGuard)
  async getGroupRecordWithParam(
    @Response() res,
    @Param('groupName') groupName: string,
  ) {
    return this.getGroupRecord(res, groupName);
  }

  // helper method to avoid duplicating logic
  private async getGroupRecord(
    res: any,
    groupName?: string,
  ) {
    this.ldapService.getGroupRecord(groupName, GroupTypeOu.PROFILES, true)
      .then((user: SearchGroupRecordResponseDto) => {
        res.status(HttpStatus.CREATED).send(user);
      })
      .catch((error) => {
        res.status(HttpStatus.BAD_REQUEST).send({ error: (error.message) ? error.message : error });
      });
  }
}
