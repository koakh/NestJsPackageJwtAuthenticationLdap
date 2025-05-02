import { HttpExceptionFilter } from '@koakh/nestjs-package-jwt-authentication-ldap';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Disable strict type checking for versioning
    snapshot: true,
  });

  app.setGlobalPrefix('v1');
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    // Add additional validation options if needed
    forbidNonWhitelisted: true,
  }));
  app.useGlobalFilters(new HttpExceptionFilter());

  const options = new DocumentBuilder()
    .setTitle(process.env.npm_package_name || 'App')
    .setDescription(`The ${process.env.npm_package_name || 'App'} API description`)
    .setVersion(process.env.npm_package_version || '1.0.0')
    .addTag(process.env.npm_package_tag || 'default')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  const serverPort = process.env.HTTP_SERVER_PORT || 3000;
  await app.listen(serverPort).then(() => {
    Logger.log(`Server exposed at http://localhost:${serverPort}/v1`, 'Main');
    Logger.log(`API docs exposed at http://localhost:${serverPort}/api`, 'Main');
  });
}

bootstrap().catch(err => {
  // tslint:disable-next-line:no-console
  console.error('Bootstrap failed', err);
  process.exit(1);
});
