import { ConfigService } from '@nestjs/config';
import { StrapiAboutMeMenuRepositoryAdapter } from '@strapi/infrastructure/adapters';
import { HttpClientPort } from '@shared/http-client/domain/ports/http-client.port';

describe('StrapiAboutMeMenuRepositoryAdapter', () => {
  let adapter: StrapiAboutMeMenuRepositoryAdapter;
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

  const createApiItem = (
    overrides: Partial<{
      id: number;
      enable: boolean;
      order: number;
      menuName: string;
      menuType: string;
      country: string;
      maintenance_mode: boolean;
      title: string;
      description: string;
      locale: string;
    }> = {},
  ) => ({
    id: overrides.id ?? 1,
    enable: overrides.enable ?? true,
    order: overrides.order ?? 1,
    menuName: overrides.menuName ?? 'profile-menu',
    menuType: overrides.menuType ?? 'about-me',
    country: overrides.country ?? 'CO',
    maintenance_mode: overrides.maintenance_mode ?? false,
    title: overrides.title,
    description: overrides.description,
    locale: overrides.locale ?? 'es',
  });

  const createStrapiApiResponse = (
    items: ReturnType<typeof createApiItem>[],
  ) => ({
    data: {
      data: items,
      meta: { pagination: { total: items.length } },
    },
    status: 200,
    statusText: 'OK',
    headers: {},
  });

  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    mockConfigService = createMockConfigService();
    adapter = new StrapiAboutMeMenuRepositoryAdapter(
      mockHttpClient,
      mockConfigService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all about me menu items from Strapi', async () => {
      const response = createStrapiApiResponse([
        createApiItem({ id: 1, menuName: 'profile' }),
        createApiItem({ id: 2, menuName: 'settings' }),
      ]);
      mockHttpClient.get.mockResolvedValue(response);

      const result = await adapter.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it('should call Strapi API with correct URL and headers', async () => {
      mockHttpClient.get.mockResolvedValue(createStrapiApiResponse([]));

      await adapter.findAll();

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `${BASE_URL}api/about-me-menus`,
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

    it('should filter items by country with strict equality', async () => {
      const response = createStrapiApiResponse([
        createApiItem({ id: 1, country: 'CO' }),
        createApiItem({ id: 2, country: 'PY' }),
        createApiItem({ id: 3, country: 'CO' }),
      ]);
      mockHttpClient.get.mockResolvedValue(response);

      const result = await adapter.findAll({ country: 'CO' });

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(3);
    });

    it('should return empty array when country filter matches nothing', async () => {
      const response = createStrapiApiResponse([
        createApiItem({ id: 1, country: 'CO' }),
      ]);
      mockHttpClient.get.mockResolvedValue(response);

      const result = await adapter.findAll({ country: 'PY' });

      expect(result).toEqual([]);
    });

    it('should return all items when no country filter', async () => {
      const response = createStrapiApiResponse([
        createApiItem({ id: 1, country: 'CO' }),
        createApiItem({ id: 2, country: 'PY' }),
      ]);
      mockHttpClient.get.mockResolvedValue(response);

      const result = await adapter.findAll();

      expect(result).toHaveLength(2);
    });

    it('should filter items by menuType with strict equality', async () => {
      const response = createStrapiApiResponse([
        createApiItem({ id: 1, menuType: 'about-me' }),
        createApiItem({ id: 2, menuType: 'settings' }),
        createApiItem({ id: 3, menuType: 'about-me' }),
      ]);
      mockHttpClient.get.mockResolvedValue(response);

      const result = await adapter.findAll({ menuType: 'about-me' });

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(3);
    });

    it('should filter by both country and menuType', async () => {
      const response = createStrapiApiResponse([
        createApiItem({ id: 1, country: 'CO', menuType: 'about-me' }),
        createApiItem({ id: 2, country: 'CO', menuType: 'settings' }),
        createApiItem({ id: 3, country: 'PY', menuType: 'about-me' }),
      ]);
      mockHttpClient.get.mockResolvedValue(response);

      const result = await adapter.findAll({
        country: 'CO',
        menuType: 'about-me',
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('should return empty array for empty Strapi response', async () => {
      mockHttpClient.get.mockResolvedValue(createStrapiApiResponse([]));

      const result = await adapter.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return about me menu item when found', async () => {
      const response = createStrapiApiResponse([
        createApiItem({ id: 3, menuName: 'other' }),
        createApiItem({ id: 5, menuName: 'profile' }),
      ]);
      mockHttpClient.get.mockResolvedValue(response);

      const result = await adapter.findById(5);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(5);
      expect(result!.menuName).toBe('profile');
    });

    it('should call Strapi list endpoint and filter locally', async () => {
      mockHttpClient.get.mockResolvedValue(
        createStrapiApiResponse([createApiItem({ id: 10 })]),
      );

      await adapter.findById(10);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `${BASE_URL}api/about-me-menus`,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${API_TOKEN}` },
        }),
      );
    });

    it('should return null when id not found in list', async () => {
      const response = createStrapiApiResponse([
        createApiItem({ id: 1 }),
        createApiItem({ id: 2 }),
      ]);
      mockHttpClient.get.mockResolvedValue(response);

      const result = await adapter.findById(999);

      expect(result).toBeNull();
    });

    it('should pass locale as query param', async () => {
      mockHttpClient.get.mockResolvedValue(
        createStrapiApiResponse([createApiItem({ id: 1 })]),
      );

      await adapter.findById(1, { locale: 'pt' });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: { populate: '*', locale: 'pt' },
        }),
      );
    });

    it('should filter by country before matching id', async () => {
      const response = createStrapiApiResponse([
        createApiItem({ id: 5, country: 'CO' }),
        createApiItem({ id: 5, country: 'PY' }),
      ]);
      mockHttpClient.get.mockResolvedValue(response);

      const result = await adapter.findById(5, { country: 'PY' });

      expect(result).not.toBeNull();
      expect(result!.country).toBe('PY');
    });

    it('should return null when id exists but country does not match', async () => {
      const response = createStrapiApiResponse([
        createApiItem({ id: 5, country: 'CO' }),
      ]);
      mockHttpClient.get.mockResolvedValue(response);

      const result = await adapter.findById(5, { country: 'PY' });

      expect(result).toBeNull();
    });

    it('should filter by menuType before matching id', async () => {
      const response = createStrapiApiResponse([
        createApiItem({ id: 5, menuType: 'about-me' }),
        createApiItem({ id: 5, menuType: 'settings' }),
      ]);
      mockHttpClient.get.mockResolvedValue(response);

      const result = await adapter.findById(5, { menuType: 'settings' });

      expect(result).not.toBeNull();
      expect(result!.menuType).toBe('settings');
    });

    it('should return null when id exists but menuType does not match', async () => {
      const response = createStrapiApiResponse([
        createApiItem({ id: 5, menuType: 'about-me' }),
      ]);
      mockHttpClient.get.mockResolvedValue(response);

      const result = await adapter.findById(5, { menuType: 'settings' });

      expect(result).toBeNull();
    });

    it('should return null when Strapi throws error', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Connection refused'));

      const result = await adapter.findById(999);

      expect(result).toBeNull();
    });
  });
});
