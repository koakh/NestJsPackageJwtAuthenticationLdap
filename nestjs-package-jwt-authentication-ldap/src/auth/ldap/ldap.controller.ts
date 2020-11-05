import { Body, Controller, Get, HttpStatus, Post, Response, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards';
import { CreateLdapUserDto } from './dto';
import { constants as c } from './ldap.constants';
import { LdapService } from './ldap.service';
import { parseTemplate } from './ldap.util';

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
  async create(
    @Response() res,
    @Body() createLdapUserDto: CreateLdapUserDto,
  ): Promise<void> {
    this.ldapService.createUserRecord(createLdapUserDto)
      .then(() => {
        res.status(HttpStatus.CREATED).send({ message: parseTemplate(c.USER_CREATED, createLdapUserDto), user: createLdapUserDto });
      })
      .catch((error) => {
        res.status(HttpStatus.CONFLICT).send(error);
      });
  }
}
