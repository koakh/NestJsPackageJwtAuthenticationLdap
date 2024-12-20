"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nestjs_package_jwt_authentication_ldap_1 = require("@koakh/nestjs-package-jwt-authentication-ldap");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Remove or comment out any versioning setup if it's causing conflicts
    // app.enableVersioning(...); 
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true }));
    app.useGlobalFilters(new nestjs_package_jwt_authentication_ldap_1.HttpExceptionFilter());
    const options = new swagger_1.DocumentBuilder()
        .setTitle(process.env.npm_package_name || 'App')
        .setDescription(`The ${process.env.npm_package_name || 'App'} API description`)
        .setVersion(process.env.npm_package_version || '1.0.0')
        .addTag(process.env.npm_package_tag || 'default')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, options);
    swagger_1.SwaggerModule.setup('api', app, document);
    const serverPort = process.env.HTTP_SERVER_PORT || 3000;
    await app.listen(serverPort).then(() => {
        common_1.Logger.log(`Server exposed at http://localhost:${serverPort}/v1`, 'Main');
        common_1.Logger.log(`API docs exposed at http://localhost:${serverPort}/api`, 'Main');
    });
}
bootstrap().catch(err => {
    console.error('Bootstrap failed', err);
    process.exit(1);
});
