import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from '@/app.module';
import { assertSecretsAreSecure } from '@config';
import {
  HttpExceptionFilter,
  ResponseInterceptor,
  WinstonLoggerAdapter,
  INJECTION_TOKENS,
} from '@shared';
import { LoggerPort } from '@shared/logging';

async function bootstrap() {
  // Validate secrets before starting the application
  assertSecretsAreSecure();

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get<LoggerPort>(INJECTION_TOKENS.LOGGER);
  const winstonLogger = app.get(WinstonLoggerAdapter);
  app.useLogger(winstonLogger);

  app.use(helmet());

  const configService = app.get(ConfigService);

  const port = configService.get<number>('app.port') ?? 3000;
  const apiVersion = configService.get<string>('app.apiVersion') ?? 'v1';
  const corsOrigin = configService.get<string>('app.corsOrigin') ?? '*';

  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(app.get(ResponseInterceptor));
  app.useGlobalFilters(app.get(HttpExceptionFilter));

  app.setGlobalPrefix(`api/${apiVersion}`);

  // Swagger documentation setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Claude Demo API')
    .setDescription('API documentation for the Claude Demo application')
    .setVersion(apiVersion)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port);

  const appUrl = await app.getUrl();

  logger
    .setContext('Bootstrap')
    .info(`Application is running on: ${appUrl}/api/${apiVersion}`);
  logger
    .setContext('Bootstrap')
    .info(`Swagger docs available at: ${appUrl}/docs`);
}
void bootstrap();
