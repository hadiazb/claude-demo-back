import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { ThrottlerStorage } from '@nestjs/throttler';
import { AppModule } from '@/app.module';
import { INJECTION_TOKENS } from '@shared/constants/injection-tokens';
import { RedisCacheAdapter } from '@shared/cache/infrastructure/adapters/redis-cache.adapter';
import { ResponseInterceptor } from '@shared/infrastructure/interceptors/response.interceptor';
import { HttpExceptionFilter } from '@shared/infrastructure/filters/http-exception.filter';
import { UserOrmEntity } from '@users/infrastructure/persistence/entities/user.orm-entity';
import { RefreshTokenOrmEntity } from '@auth/infrastructure/persistence/entities/refresh-token.orm-entity';
import {
  InMemoryUserRepository,
  InMemoryTokenRepository,
  InMemoryCacheAdapter,
  createMockLoggerForE2e,
  createMockEmail,
  createMockHttpClient,
} from './mocks';

// Set environment variables before module compilation
process.env.JWT_ACCESS_SECRET = 'test-access-secret-for-e2e';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-for-e2e';
process.env.STRAPI_WEBHOOK_SECRET = 'test-webhook-secret';
process.env.STRAPI_API_URL = 'http://mock-strapi/';
process.env.STRAPI_API_TOKEN = 'mock-token';
process.env.APP_ENV = 'test';

export interface E2eTestApp {
  app: INestApplication;
  userRepository: InMemoryUserRepository;
  tokenRepository: InMemoryTokenRepository;
  cacheAdapter: InMemoryCacheAdapter;
  mockEmail: ReturnType<typeof createMockEmail>;
  mockHttpClient: ReturnType<typeof createMockHttpClient>;
  mockLogger: ReturnType<typeof createMockLoggerForE2e>;
  reset: () => void;
}

export async function createE2eTestApp(): Promise<E2eTestApp> {
  const userRepository = new InMemoryUserRepository();
  const tokenRepository = new InMemoryTokenRepository();
  const cacheAdapter = new InMemoryCacheAdapter();
  const mockEmail = createMockEmail();
  const mockHttpClient = createMockHttpClient();
  const mockLogger = createMockLoggerForE2e();

  const mockDataSource = {
    isInitialized: true,
    initialize: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
    runMigrations: jest.fn().mockResolvedValue([]),
    entityMetadatas: [],
    getRepository: jest.fn().mockReturnValue({}),
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: { save: jest.fn(), find: jest.fn() },
    }),
  };

  const mockOrmRepository = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      getOne: jest.fn().mockResolvedValue(null),
    }),
  };

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(getDataSourceToken())
    .useValue(mockDataSource)
    .overrideProvider(getRepositoryToken(UserOrmEntity))
    .useValue(mockOrmRepository)
    .overrideProvider(getRepositoryToken(RefreshTokenOrmEntity))
    .useValue(mockOrmRepository)
    .overrideProvider(RedisCacheAdapter)
    .useValue(cacheAdapter)
    .overrideProvider(INJECTION_TOKENS.CACHE)
    .useValue(cacheAdapter)
    .overrideProvider(INJECTION_TOKENS.USER_REPOSITORY)
    .useValue(userRepository)
    .overrideProvider(INJECTION_TOKENS.TOKEN_REPOSITORY)
    .useValue(tokenRepository)
    .overrideProvider(INJECTION_TOKENS.EMAIL)
    .useValue(mockEmail)
    .overrideProvider(INJECTION_TOKENS.HTTP_CLIENT)
    .useValue(mockHttpClient)
    .overrideProvider(INJECTION_TOKENS.LOGGER)
    .useValue(mockLogger)
    .overrideProvider(ThrottlerStorage)
    .useValue({
      increment: jest.fn().mockResolvedValue({
        totalHits: 0,
        timeToExpire: 0,
        isBlocked: false,
        timeToBlockExpire: 0,
      }),
      onApplicationShutdown: jest.fn(),
    })
    .compile();

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

  // Apply ResponseInterceptor and HttpExceptionFilter like main.ts does
  const responseInterceptor = app.get(ResponseInterceptor);
  const httpExceptionFilter = app.get(HttpExceptionFilter);
  app.useGlobalInterceptors(responseInterceptor);
  app.useGlobalFilters(httpExceptionFilter);

  await app.init();

  const reset = () => {
    userRepository.clear();
    tokenRepository.clear();
    cacheAdapter.clear();
    jest.clearAllMocks();
    // Re-setup logger mock after clearAllMocks
    (mockLogger.setContext as jest.Mock).mockReturnValue(mockLogger);
  };

  return {
    app,
    userRepository,
    tokenRepository,
    cacheAdapter,
    mockEmail,
    mockHttpClient,
    mockLogger,
    reset,
  };
}

export async function closeTestApp(app: INestApplication): Promise<void> {
  await app.close();
}
