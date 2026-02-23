import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StrapiModuleRepositoryAdapter } from '@strapi/infrastructure/adapters/out/strapi-module.repository.adapter';
import { StrapiModule } from '@strapi/domain';
import { INJECTION_TOKENS } from '@shared';
import { HttpClientPort } from '@shared/http-client/domain/ports/http-client.port';

describe('StrapiModuleRepositoryAdapter (Integration)', () => {
  let adapter: StrapiModuleRepositoryAdapter;
  let mockHttpClient: jest.Mocked<HttpClientPort>;

  const strapiApiResponse = {
    data: [
      {
        documentId: 'doc-1',
        locale: 'es',
        config: {
          uid: 'uid-1',
          moduleName: 'module-a',
          title: { title: 'Module A', show: true },
          moduleId: 'mod-1',
          description: 'Module A description',
          country: ['CO', 'PY'],
          actions: [],
          form_objects: [],
          formatting: null,
          dataObjects: { backend: null, frontend: null },
        },
      },
      {
        documentId: 'doc-2',
        locale: 'es',
        config: {
          uid: 'uid-2',
          moduleName: 'module-b',
          title: { title: 'Module B', show: true },
          moduleId: 'mod-2',
          description: 'Module B description',
          country: ['BO', 'NI'],
          actions: [],
          form_objects: [],
          formatting: null,
          dataObjects: { backend: null, frontend: null },
        },
      },
    ],
    meta: {},
  };

  beforeEach(async () => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StrapiModuleRepositoryAdapter,
        {
          provide: INJECTION_TOKENS.HTTP_CLIENT,
          useValue: mockHttpClient,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                'strapi.apiUrl': 'https://strapi.test/',
                'strapi.apiToken': 'test-api-token',
              };
              return config[key] ?? '';
            }),
          },
        },
      ],
    }).compile();

    adapter = module.get(StrapiModuleRepositoryAdapter);
  });

  describe('findAll', () => {
    it('should call HttpClient.get with correct URL and headers, and map response', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: strapiApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const result = await adapter.findAll();

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'https://strapi.test/api/modules',
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-api-token' },
          params: { populate: '*' },
        }),
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(StrapiModule);
      expect(result[0].documentId).toBe('doc-1');
      expect(result[0].config.moduleName).toBe('module-a');
    });

    it('should pass locale to query params when provided', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: strapiApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      await adapter.findAll({ locale: 'en' });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'https://strapi.test/api/modules',
        expect.objectContaining({
          params: { populate: '*', locale: 'en' },
        }),
      );
    });

    it('should filter by country post-fetch using includes()', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: strapiApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const result = await adapter.findAll({ country: 'CO' });

      expect(result).toHaveLength(1);
      expect(result[0].documentId).toBe('doc-1');
      expect(result[0].config.country).toContain('CO');
    });

    it('should return empty when no modules match the country', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: strapiApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const result = await adapter.findAll({ country: 'GT' });

      expect(result).toHaveLength(0);
    });
  });

  describe('findByDocumentId', () => {
    it('should construct correct URL and map single response', async () => {
      const singleResponse = {
        data: strapiApiResponse.data[0],
        meta: {},
      };
      mockHttpClient.get.mockResolvedValue({
        data: singleResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const result = await adapter.findByDocumentId('doc-1');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'https://strapi.test/api/modules/doc-1',
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-api-token' },
        }),
      );
      expect(result).toBeInstanceOf(StrapiModule);
      expect(result!.documentId).toBe('doc-1');
    });

    it('should return null when HttpClient throws', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Not found'));

      const result = await adapter.findByDocumentId('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByModuleName', () => {
    it('should fetch all and filter locally by name', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: strapiApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const result = await adapter.findByModuleName('module-b');

      expect(result).toBeInstanceOf(StrapiModule);
      expect(result!.config.moduleName).toBe('module-b');
    });

    it('should return null when module name not found', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: strapiApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const result = await adapter.findByModuleName('nonexistent-module');

      expect(result).toBeNull();
    });

    it('should apply country filter on top of name filter', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: strapiApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      // module-a is available in CO, PY
      const result = await adapter.findByModuleName('module-a', {
        country: 'BO',
      });

      expect(result).toBeNull();
    });
  });
});
