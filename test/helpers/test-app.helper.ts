import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '@/app.module';

/**
 * Creates a fully configured NestJS application for e2e testing.
 * @returns The configured test application
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

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

  app.setGlobalPrefix('api/v1');

  await app.init();

  return app;
}

/**
 * Closes the test application and cleans up resources.
 * @param app - The application to close
 */
export async function closeTestApp(app: INestApplication): Promise<void> {
  await app.close();
}
