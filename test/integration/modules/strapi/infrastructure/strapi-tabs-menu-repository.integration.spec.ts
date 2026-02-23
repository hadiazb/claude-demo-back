import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StrapiTabsMenuRepositoryAdapter } from '@strapi/infrastructure/adapters/out/strapi-tabs-menu.repository.adapter';
import { StrapiTabsMenu } from '@strapi/domain';
import { INJECTION_TOKENS } from '@shared';
import { HttpClientPort } from '@shared/http-client/domain/ports/http-client.port';

describe('StrapiTabsMenuRepositoryAdapter (Integration)', () => {
  let adapter: StrapiTabsMenuRepositoryAdapter;
  let mockHttpClient: jest.Mocked<HttpClientPort>;

  const strapiApiResponse = {
    data: [
      {
        id: 1,
        label: 'Home',
        enabled: true,
        icon: 'home-icon',
        route: '/home',
        menuId: 'menu-1',
        menuName: 'main-menu',
        menuType: 'tabs',
        country: 'CO',
        description: 'Home tab',
        fontSize: '14px',
        locale: 'es',
      },
      {
        id: 2,
        label: 'Profile',
        enabled: true,
        icon: 'profile-icon',
        route: '/profile',
        menuId: 'menu-1',
        menuName: 'main-menu',
        menuType: 'tabs',
        country: 'PY',
        description: 'Profile tab',
        locale: 'es',
      },
      {
        id: 3,
        label: 'Settings',
        enabled: false,
        icon: 'settings-icon',
        route: '/settings',
        menuId: 'menu-2',
        menuName: 'settings-menu',
        menuType: 'sidebar',
        country: 'CO',
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
        StrapiTabsMenuRepositoryAdapter,
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

    adapter = module.get(StrapiTabsMenuRepositoryAdapter);
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
        'https://strapi.test/api/tabs-menus',
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-api-token' },
          params: { populate: '*' },
        }),
      );
      expect(result).toHaveLength(3);
      expect(result[0]).toBeInstanceOf(StrapiTabsMenu);
      expect(result[0].label).toBe('Home');
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

      const result = await adapter.findAll({ menuType: 'sidebar' });

      expect(result).toHaveLength(1);
      expect(result[0].menuType).toBe('sidebar');
    });

    it('should combine country and menuType filters', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: strapiApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const result = await adapter.findAll({ country: 'CO', menuType: 'tabs' });

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Home');
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

      expect(result).toBeInstanceOf(StrapiTabsMenu);
      expect(result!.id).toBe(2);
      expect(result!.label).toBe('Profile');
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
