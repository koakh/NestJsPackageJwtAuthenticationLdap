import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards';

@Controller('ldap')
export class LdapController {
  @Get(':skip/:take')
  @UseGuards(JwtAuthGuard)
  greeting(): { [key: string]: string } {
    return { message: 'hello from ldap' };
  }
}
