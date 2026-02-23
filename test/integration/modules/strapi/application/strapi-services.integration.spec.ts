import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StrapiModuleService } from '@strapi/application/services/strapi-module.service';
import { StrapiTabsMenuService } from '@strapi/application/services/strapi-tabs-menu.service';
import { StrapiAboutMeMenuService } from '@strapi/application/services/strapi-about-me-menu.service';
import { StrapiModuleRepositoryAdapter } from '@strapi/infrastructure/adapters/out/strapi-module.repository.adapter';
import { StrapiTabsMenuRepositoryAdapter } from '@strapi/infrastructure/adapters/out/strapi-tabs-menu.repository.adapter';
import { StrapiAboutMeMenuRepositoryAdapter } from '@strapi/infrastructure/adapters/out/strapi-about-me-menu.repository.adapter';
import {
  StrapiModule,
  StrapiTabsMenu,
  StrapiAboutMeMenu,
} from '@strapi/domain';
import { INJECTION_TOKENS } from '@shared';
import { HttpClientPort } from '@shared/http-client/domain/ports/http-client.port';

describe('Strapi Services (Integration)', () => {
  let moduleService: StrapiModuleService;
  let tabsMenuService: StrapiTabsMenuService;
  let aboutMeMenuService: StrapiAboutMeMenuService;
  let mockHttpClient: jest.Mocked<HttpClientPort>;

  const moduleApiResponse = {
    data: [
      {
        documentId: 'doc-1',
        locale: 'es',
        config: {
          uid: 'uid-1',
          moduleName: 'module-a',
          title: { title: 'Module A', show: true },
          moduleId: 'mod-1',
          description: 'Module A desc',
          country: ['CO', 'PY'],
          actions: [],
          form_objects: [],
          formatting: null,
          dataObjects: { backend: null, frontend: null },
        },
      },
    ],
    meta: {},
  };

  const tabsMenuApiResponse = {
    data: [
      {
        id: 1,
        label: 'Home',
        enabled: true,
        icon: 'home',
        route: '/home',
        menuId: 'menu-1',
        menuName: 'main',
        menuType: 'tabs',
        country: 'CO',
        locale: 'es',
      },
    ],
    meta: {},
  };

  const aboutMeMenuApiResponse = {
    data: [
      {
        id: 1,
        enable: true,
        order: 1,
        menuName: 'about',
        menuType: 'profile',
        country: 'CO',
        maintenance_mode: false,
        title: 'Info',
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
        StrapiModuleService,
        StrapiTabsMenuService,
        StrapiAboutMeMenuService,
        StrapiModuleRepositoryAdapter,
        StrapiTabsMenuRepositoryAdapter,
        StrapiAboutMeMenuRepositoryAdapter,
        {
          provide: INJECTION_TOKENS.STRAPI_MODULE_REPOSITORY,
          useExisting: StrapiModuleRepositoryAdapter,
        },
        {
          provide: INJECTION_TOKENS.STRAPI_TABS_MENU_REPOSITORY,
          useExisting: StrapiTabsMenuRepositoryAdapter,
        },
        {
          provide: INJECTION_TOKENS.STRAPI_ABOUT_ME_MENU_REPOSITORY,
          useExisting: StrapiAboutMeMenuRepositoryAdapter,
        },
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

    moduleService = module.get(StrapiModuleService);
    tabsMenuService = module.get(StrapiTabsMenuService);
    aboutMeMenuService = module.get(StrapiAboutMeMenuService);
  });

  describe('StrapiModuleService', () => {
    it('findAll should delegate to adapter which calls HttpClient and maps response', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: moduleApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const result = await moduleService.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(StrapiModule);
      expect(result[0].config.moduleName).toBe('module-a');
      expect(mockHttpClient.get).toHaveBeenCalled();
    });

    it('findAll with country filter should pass through to adapter', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: moduleApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const result = await moduleService.findAll({ country: 'CO' });

      expect(result).toHaveLength(1);
    });

    it('findAll with country filter should return empty for non-matching country', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: moduleApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const result = await moduleService.findAll({ country: 'GT' });

      expect(result).toHaveLength(0);
    });

    it('findByDocumentId should return module when found', async () => {
      const singleResponse = {
        data: moduleApiResponse.data[0],
        meta: {},
      };
      mockHttpClient.get.mockResolvedValue({
        data: singleResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const result = await moduleService.findByDocumentId('doc-1');

      expect(result).toBeInstanceOf(StrapiModule);
      expect(result.documentId).toBe('doc-1');
    });

    it('findByDocumentId should throw NotFoundException when not found', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Not found'));

      await expect(
        moduleService.findByDocumentId('nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('findByModuleName should throw NotFoundException when not found', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: moduleApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      await expect(
        moduleService.findByModuleName('nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('StrapiTabsMenuService', () => {
    it('findAll should delegate to adapter and return mapped results', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: tabsMenuApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const result = await tabsMenuService.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(StrapiTabsMenu);
      expect(result[0].label).toBe('Home');
    });

    it('findById should return item when found', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: tabsMenuApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const result = await tabsMenuService.findById(1);

      expect(result).toBeInstanceOf(StrapiTabsMenu);
      expect(result.id).toBe(1);
    });

    it('findById should throw NotFoundException when not found', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: tabsMenuApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      await expect(tabsMenuService.findById(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('findAll with locale and country query params', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: tabsMenuApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const result = await tabsMenuService.findAll({
        locale: 'es',
        country: 'CO',
        menuType: 'tabs',
      });

      expect(result).toHaveLength(1);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: { populate: '*', locale: 'es' },
        }),
      );
    });
  });

  describe('StrapiAboutMeMenuService', () => {
    it('findAll should delegate to adapter and return mapped results', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: aboutMeMenuApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const result = await aboutMeMenuService.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(StrapiAboutMeMenu);
      expect(result[0].title).toBe('Info');
    });

    it('findById should return item when found', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: aboutMeMenuApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const result = await aboutMeMenuService.findById(1);

      expect(result).toBeInstanceOf(StrapiAboutMeMenu);
      expect(result.id).toBe(1);
    });

    it('findById should throw NotFoundException when not found', async () => {
      mockHttpClient.get.mockResolvedValue({
        data: aboutMeMenuApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      await expect(aboutMeMenuService.findById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
