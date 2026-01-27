import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '@/app.module';
import {
  HttpExceptionFilter,
  ResponseInterceptor,
  WinstonLoggerAdapter,
  INJECTION_TOKENS,
} from '@shared';
import { LoggerPort } from '@shared/logging';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get<LoggerPort>(INJECTION_TOKENS.LOGGER);
  const winstonLogger = app.get(WinstonLoggerAdapter);
  app.useLogger(winstonLogger);

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

  await app.listen(port);

  const appUrl = await app.getUrl();

  logger
    .setContext('Bootstrap')
    .info(`Application is running on: ${appUrl}/api/${apiVersion}`);
}
void bootstrap();
