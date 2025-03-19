import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// this is required and important, this will put ldap working

@Injectable()
export class LdapAuthGuard extends AuthGuard('ldap') { }
