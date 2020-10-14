import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@koakh/nestjs-package-jwt-authentication-ldap';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // config module
    ConfigModule.forRoot({ isGlobal: true, }),
    // the trick is import the module, not the service here, this will expose AppController to
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule { }
