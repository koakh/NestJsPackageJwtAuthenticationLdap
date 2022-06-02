import { Body, Controller, Delete, Get, HttpStatus, NotFoundException, Param, Post, Put, Request, Response, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { config } from 'dotenv';
import { Roles, Permissions } from '../decorators';
import { UserRoles } from '../enums';
import { JwtAuthGuard, PermissionsAuthGuard } from '../guards';
import { parseTemplate } from '../utils';
// tslint:disable-next-line: max-line-length
import { AddOrDeleteUserToGroupDto, CacheResponseDto, ChangeDefaultGroupDto, ChangeUserPasswordDto, ChangeUserProfileDto, ChangeUserRecordDto, CreateGroupRecordDto, CreateUserRecordDto, DeleteGroupRecordDto, DeleteUserRecordDto, SearchGroupRecordResponseDto, SearchUserPaginatorResponseDto, SearchUserRecordResponseDto, SearchUserRecordsDto } from './dto';
import { ChangeUserRecordOperation, GroupTypeOu, UpdateCacheOperation } from './enums';
import { LdapDeleteUsersGuard, LdapUpdateUsersGuard } from './guards';
import { constants as c } from './ldap.constants';
import { LdapService } from './ldap.service';

config();

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
  @Roles(process.env.AUTH_ADMIN_ROLE || UserRoles.ROLE_ADMIN)
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
  @Roles(process.env.AUTH_ADMIN_ROLE || UserRoles.ROLE_ADMIN)
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
  @Roles(process.env.AUTH_ADMIN_ROLE || UserRoles.ROLE_ADMIN)
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
  @Roles(process.env.AUTH_ADMIN_ROLE || UserRoles.ROLE_ADMIN)
  @Permissions(process.env.LDAP_CONTROLLER_PERMISSION_GET_USER)
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
  @Roles(process.env.AUTH_ADMIN_ROLE || UserRoles.ROLE_ADMIN)
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
  @Roles(process.env.AUTH_ADMIN_ROLE || UserRoles.ROLE_ADMIN)
  @UseGuards(JwtAuthGuard)
  async updateUserRecordsCache(
    @Response() res,
    @Body() payload: string[],
  ): Promise<void> {
    for (let i = 0; i < payload.length; i++) {
      this.ldapService.updateCachedUser(UpdateCacheOperation.CREATE, payload[i]).catch((error) => {
        res.status(HttpStatus.BAD_REQUEST).send({ error: (error.message) ? error.message : error });
      });
    }
    res.status(HttpStatus.CREATED).send({});
  }

  @Post('/cache/search')
  @Roles(process.env.AUTH_ADMIN_ROLE || UserRoles.ROLE_ADMIN)
  @Permissions(process.env.LDAP_CONTROLLER_PERMISSION_GET_USER)
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
  @Roles(process.env.AUTH_ADMIN_ROLE || UserRoles.ROLE_ADMIN)
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
  @Roles(process.env.AUTH_ADMIN_ROLE || UserRoles.ROLE_ADMIN)
  // @UseGuards(LdapUpdateUsersGuard)
  @UseGuards(PermissionsAuthGuard)
  @UseGuards(JwtAuthGuard)
  async changeUserRecord(
    @Response() res,
    @Body() changeUserRecordDto: ChangeUserRecordDto,
  ): Promise<void> {
    this.ldapService.changeUserRecord(changeUserRecordDto)
      .then(() => {
        res.status(HttpStatus.NO_CONTENT).send();
      })
      .catch((error) => {
        res.status(HttpStatus.BAD_REQUEST).send({ error: (error.message) ? error.message : error });
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
  @Roles(process.env.AUTH_ADMIN_ROLE || UserRoles.ROLE_ADMIN)
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
  @Roles(process.env.AUTH_ADMIN_ROLE || UserRoles.ROLE_ADMIN)
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

  @Get('/group/:groupName?')
  @ApiParam({ name: 'groupName', required: false, type: 'string' })
  @Roles(process.env.AUTH_ADMIN_ROLE || UserRoles.ROLE_ADMIN)
  @UseGuards(PermissionsAuthGuard)
  @UseGuards(JwtAuthGuard)
  async getGroupRecord(
    @Response() res,
    @Param('groupName') groupName?: string,
  ): Promise<void> {
    this.ldapService.getGroupRecord(groupName, GroupTypeOu.PROFILES, true)
      .then((user: SearchGroupRecordResponseDto) => {
        res.status(HttpStatus.CREATED).send(user);
      })
      .catch((error) => {
        res.status(HttpStatus.BAD_REQUEST).send({ error: (error.message) ? error.message : error });
      });
  }
}
