import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@koakh/nestjs-package-jwt-authentication-ldap';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // pipes middleware
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  // global-scoped filter, custom nestjs packages use global-scoped filter directly in modules
  app.useGlobalFilters(new HttpExceptionFilter());
  const serverPort = process.env.HTTP_SERVER_PORT;
  await app.listen(process.env.HTTP_SERVER_PORT).then(() => Logger.log(`server started at http://localhost:${serverPort}`, 'Main'));
}

bootstrap();
