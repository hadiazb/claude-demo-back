import { ConfigService } from '@nestjs/config';
import { StrapiModuleRepositoryAdapter } from '@strapi/infrastructure/adapters';
import { HttpClientPort } from '@shared/http-client/domain/ports/http-client.port';
import { StrapiModuleConfig } from '@strapi/domain';

describe('StrapiModuleRepositoryAdapter', () => {
  let adapter: StrapiModuleRepositoryAdapter;
  let mockHttpClient: jest.Mocked<HttpClientPort>;
  let mockConfigService: jest.Mocked<ConfigService>;

  const BASE_URL = 'https://strapi.example.com/';
  const API_TOKEN = 'test-api-token';

  const createMockHttpClient = (): jest.Mocked<HttpClientPort> =>
    ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    }) as unknown as jest.Mocked<HttpClientPort>;

  const createMockConfigService = (): jest.Mocked<ConfigService> =>
    ({
      get: jest.fn((key: string, defaultValue?: string) => {
        const config: Record<string, string> = {
          'strapi.apiUrl': BASE_URL,
          'strapi.apiToken': API_TOKEN,
        };
        return config[key] ?? defaultValue;
      }),
    }) as unknown as jest.Mocked<ConfigService>;

  const createConfig = (
    overrides: Partial<StrapiModuleConfig> = {},
  ): StrapiModuleConfig => ({
    uid: 'module-uid-001',
    moduleName: 'test-module',
    title: { title: 'Test Title', show: true },
    moduleId: 'mod-001',
    description: 'Test description',
    country: ['CO'],
    actions: [],
    form_objects: [],
    formatting: null,
    dataObjects: { backend: null, frontend: null },
    ...overrides,
  });

  const createStrapiApiResponse = (
    items: Array<{
      documentId: string;
      config: StrapiModuleConfig;
      locale?: string;
    }>,
  ) => ({
    data: {
      data: items.map((item) => ({
        documentId: item.documentId,
        config: item.config,
        locale: item.locale || 'es',
      })),
      meta: { pagination: { total: items.length } },
    },
    status: 200,
    statusText: 'OK',
    headers: {},
  });

  const createStrapiSingleResponse = (item: {
    documentId: string;
    config: StrapiModuleConfig;
    locale?: string;
  }) => ({
    data: {
      data: {
        documentId: item.documentId,
        config: item.config,
        locale: item.locale || 'es',
      },
      meta: {},
    },
    status: 200,
    statusText: 'OK',
    headers: {},
  });

  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    mockConfigService = createMockConfigService();
    adapter = new StrapiModuleRepositoryAdapter(
      mockHttpClient,
      mockConfigService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all modules from Strapi', async () => {
      const response = createStrapiApiResponse([
        { documentId: 'doc-1', config: createConfig({ moduleName: 'mod-1' }) },
        { documentId: 'doc-2', config: createConfig({ moduleName: 'mod-2' }) },
      ]);
      mockHttpClient.get.mockResolvedValue(response);

      const result = await adapter.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].documentId).toBe('doc-1');
      expect(result[1].documentId).toBe('doc-2');
    });

    it('should call Strapi API with correct URL and headers', async () => {
      mockHttpClient.get.mockResolvedValue(createStrapiApiResponse([]));

      await adapter.findAll();

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `${BASE_URL}api/modules`,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${API_TOKEN}` },
          params: { populate: '*' },
        }),
      );
    });

    it('should pass locale as query param', async () => {
      mockHttpClient.get.mockResolvedValue(createStrapiApiResponse([]));

      await adapter.findAll({ locale: 'en' });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: { populate: '*', locale: 'en' },
        }),
      );
    });

    it('should filter modules by country locally', async () => {
      const response = createStrapiApiResponse([
        { documentId: 'doc-co', config: createConfig({ country: ['CO'] }) },
        { documentId: 'doc-py', config: createConfig({ country: ['PY'] }) },
        { documentId: 'doc-co2', config: createConfig({ country: ['CO'] }) },
      ]);
      mockHttpClient.get.mockResolvedValue(response);

      const result = await adapter.findAll({ country: 'CO' });

      expect(result).toHaveLength(2);
      expect(result[0].documentId).toBe('doc-co');
      expect(result[1].documentId).toBe('doc-co2');
    });

    it('should return empty array when country filter matches nothing', async () => {
      const response = createStrapiApiResponse([
        { documentId: 'doc-co', config: createConfig({ country: ['CO'] }) },
      ]);
      mockHttpClient.get.mockResolvedValue(response);

      const result = await adapter.findAll({ country: 'PY' });

      expect(result).toEqual([]);
    });

    it('should return all modules when no country filter', async () => {
      const response = createStrapiApiResponse([
        { documentId: 'doc-1', config: createConfig({ country: ['CO'] }) },
        { documentId: 'doc-2', config: createConfig({ country: ['PY'] }) },
      ]);
      mockHttpClient.get.mockResolvedValue(response);

      const result = await adapter.findAll();

      expect(result).toHaveLength(2);
    });

    it('should return empty array for empty Strapi response', async () => {
      mockHttpClient.get.mockResolvedValue(createStrapiApiResponse([]));

      const result = await adapter.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findByDocumentId', () => {
    it('should return module when found', async () => {
      const response = createStrapiSingleResponse({
        documentId: 'doc-found',
        config: createConfig({ moduleName: 'found-module' }),
      });
      mockHttpClient.get.mockResolvedValue(response);

      const result = await adapter.findByDocumentId('doc-found');

      expect(result).not.toBeNull();
      expect(result!.documentId).toBe('doc-found');
      expect(result!.config.moduleName).toBe('found-module');
    });

    it('should call Strapi API with documentId in URL', async () => {
      mockHttpClient.get.mockResolvedValue(
        createStrapiSingleResponse({
          documentId: 'doc-123',
          config: createConfig(),
        }),
      );

      await adapter.findByDocumentId('doc-123');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `${BASE_URL}api/modules/doc-123`,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${API_TOKEN}` },
        }),
      );
    });

    it('should pass locale as query param', async () => {
      mockHttpClient.get.mockResolvedValue(
        createStrapiSingleResponse({
          documentId: 'doc-123',
          config: createConfig(),
        }),
      );

      await adapter.findByDocumentId('doc-123', { locale: 'pt' });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: { populate: '*', locale: 'pt' },
        }),
      );
    });

    it('should return null when Strapi throws error', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Not found'));

      const result = await adapter.findByDocumentId('doc-missing');

      expect(result).toBeNull();
    });
  });

  describe('findByModuleName', () => {
    it('should return module matching moduleName', async () => {
      const response = createStrapiApiResponse([
        { documentId: 'doc-1', config: createConfig({ moduleName: 'target' }) },
        { documentId: 'doc-2', config: createConfig({ moduleName: 'other' }) },
      ]);
      mockHttpClient.get.mockResolvedValue(response);

      const result = await adapter.findByModuleName('target');

      expect(result).not.toBeNull();
      expect(result!.documentId).toBe('doc-1');
      expect(result!.config.moduleName).toBe('target');
    });

    it('should return null when no module matches moduleName', async () => {
      const response = createStrapiApiResponse([
        { documentId: 'doc-1', config: createConfig({ moduleName: 'other' }) },
      ]);
      mockHttpClient.get.mockResolvedValue(response);

      const result = await adapter.findByModuleName('non-existent');

      expect(result).toBeNull();
    });

    it('should filter by moduleName and country', async () => {
      const response = createStrapiApiResponse([
        {
          documentId: 'doc-co',
          config: createConfig({ moduleName: 'target', country: ['CO'] }),
        },
        {
          documentId: 'doc-py',
          config: createConfig({ moduleName: 'target', country: ['PY'] }),
        },
      ]);
      mockHttpClient.get.mockResolvedValue(response);

      const result = await adapter.findByModuleName('target', {
        country: 'PY',
      });

      expect(result).not.toBeNull();
      expect(result!.documentId).toBe('doc-py');
      expect(result!.config.country).toEqual(['PY']);
    });

    it('should return null when moduleName matches but country does not', async () => {
      const response = createStrapiApiResponse([
        {
          documentId: 'doc-co',
          config: createConfig({ moduleName: 'target', country: ['CO'] }),
        },
      ]);
      mockHttpClient.get.mockResolvedValue(response);

      const result = await adapter.findByModuleName('target', {
        country: 'BO',
      });

      expect(result).toBeNull();
    });

    it('should return first match when multiple modules have same name', async () => {
      const response = createStrapiApiResponse([
        {
          documentId: 'doc-first',
          config: createConfig({ moduleName: 'shared-name' }),
        },
        {
          documentId: 'doc-second',
          config: createConfig({ moduleName: 'shared-name' }),
        },
      ]);
      mockHttpClient.get.mockResolvedValue(response);

      const result = await adapter.findByModuleName('shared-name');

      expect(result!.documentId).toBe('doc-first');
    });

    it('should return null when Strapi throws error', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Connection refused'));

      const result = await adapter.findByModuleName('any-module');

      expect(result).toBeNull();
    });

    it('should pass locale to Strapi query', async () => {
      mockHttpClient.get.mockResolvedValue(createStrapiApiResponse([]));

      await adapter.findByModuleName('test', { locale: 'en' });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: { populate: '*', locale: 'en' },
        }),
      );
    });
  });
});
