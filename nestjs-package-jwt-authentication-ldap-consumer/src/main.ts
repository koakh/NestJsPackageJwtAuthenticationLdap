import { HttpExceptionFilter } from '@koakh/nestjs-package-jwt-authentication-ldap';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // base prefix
  app.setGlobalPrefix('v1');
  // openapi: must use nest cli, else it won't work
  const options = new DocumentBuilder()
    .setTitle(process.env.npm_package_name)
    .setDescription(`The ${process.env.npm_package_name} API description`)
    .setVersion(process.env.npm_package_version)
    .addTag(process.env.npm_package_tag)
    .setBasePath('..')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  // pipes middleware
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  // global-scoped filter, custom nestjs packages use global-scoped filter directly in modules
  app.useGlobalFilters(new HttpExceptionFilter());
  // boot server
  const serverPort = 3010;//process.env.HTTP_SERVER_PORT;
  await app.listen(serverPort).then(() => Logger.log(`server started at http://localhost:${serverPort}`, 'Main'));
}

bootstrap();
