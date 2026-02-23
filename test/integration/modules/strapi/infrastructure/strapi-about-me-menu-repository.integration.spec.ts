import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StrapiAboutMeMenuRepositoryAdapter } from '@strapi/infrastructure/adapters/out/strapi-about-me-menu.repository.adapter';
import { StrapiAboutMeMenu } from '@strapi/domain';
import { INJECTION_TOKENS } from '@shared';
import { HttpClientPort } from '@shared/http-client/domain/ports/http-client.port';

describe('StrapiAboutMeMenuRepositoryAdapter (Integration)', () => {
  let adapter: StrapiAboutMeMenuRepositoryAdapter;
  let mockHttpClient: jest.Mocked<HttpClientPort>;

  const strapiApiResponse = {
    data: [
      {
        id: 1,
        enable: true,
        order: 1,
        menuName: 'about-menu',
        menuType: 'profile',
        country: 'CO',
        maintenance_mode: false,
        title: 'Personal Info',
        description: 'Your personal information',
        locale: 'es',
      },
      {
        id: 2,
        enable: true,
        order: 2,
        menuName: 'about-menu',
        menuType: 'profile',
        country: 'PY',
        maintenance_mode: false,
        title: 'Documents',
        description: 'Your documents',
        locale: 'es',
      },
      {
        id: 3,
        enable: false,
        order: 3,
        menuName: 'about-menu',
        menuType: 'settings',
        country: 'CO',
        maintenance_mode: true,
        title: 'Preferences',
        locale: 'es',
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
        StrapiAboutMeMenuRepositoryAdapter,
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

    adapter = module.get(StrapiAboutMeMenuRepositoryAdapter);
  });

  describe('findAll', () => {
    it('should fetch, map, and return all items', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: strapiApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const result = await adapter.findAll();

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        'https://strapi.test/api/about-me-menus',
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-api-token' },
          params: { populate: '*' },
        }),
      );
      expect(result).toHaveLength(3);
      expect(result[0]).toBeInstanceOf(StrapiAboutMeMenu);
      expect(result[0].title).toBe('Personal Info');
    });

    it('should filter by country using strict equality (===)', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: strapiApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const result = await adapter.findAll({ country: 'CO' });

      expect(result).toHaveLength(2);
      result.forEach((item) => expect(item.country).toBe('CO'));
    });

    it('should filter by menuType', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: strapiApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const result = await adapter.findAll({ menuType: 'settings' });

      expect(result).toHaveLength(1);
      expect(result[0].menuType).toBe('settings');
      expect(result[0].maintenance_mode).toBe(true);
    });

    it('should combine country and menuType filters', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: strapiApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const result = await adapter.findAll({
        country: 'CO',
        menuType: 'profile',
      });

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Personal Info');
    });

    it('should pass locale to query params', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: strapiApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      await adapter.findAll({ locale: 'en' });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: { populate: '*', locale: 'en' },
        }),
      );
    });
  });

  describe('findById', () => {
    it('should fetch all and find by numeric id', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: strapiApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const result = await adapter.findById(2);

      expect(result).toBeInstanceOf(StrapiAboutMeMenu);
      expect(result!.id).toBe(2);
      expect(result!.title).toBe('Documents');
    });

    it('should return null when id not found', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: strapiApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const result = await adapter.findById(999);

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Network error'));

      const result = await adapter.findById(1);

      expect(result).toBeNull();
    });
  });
});
