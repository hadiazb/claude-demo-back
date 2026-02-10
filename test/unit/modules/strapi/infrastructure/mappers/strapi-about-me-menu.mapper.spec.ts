import { StrapiAboutMeMenuMapper } from '@strapi/infrastructure/mappers';
import { StrapiAboutMeMenu } from '@strapi/domain';

describe('StrapiAboutMeMenuMapper', () => {
  const createApiData = (
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

  describe('toDomain', () => {
    it('should convert API data to domain entity', () => {
      const apiData = createApiData();

      const result = StrapiAboutMeMenuMapper.toDomain(apiData);

      expect(result).toBeInstanceOf(StrapiAboutMeMenu);
      expect(result.id).toBe(1);
      expect(result.menuName).toBe('profile-menu');
      expect(result.locale).toBe('es');
    });

    it('should preserve all properties', () => {
      const apiData = createApiData({
        id: 5,
        enable: false,
        order: 3,
        menuName: 'settings-menu',
        menuType: 'settings',
        country: 'PY',
        maintenance_mode: true,
        title: 'Settings Title',
        description: 'Settings description',
        locale: 'en',
      });

      const result = StrapiAboutMeMenuMapper.toDomain(apiData);

      expect(result.id).toBe(5);
      expect(result.enable).toBe(false);
      expect(result.order).toBe(3);
      expect(result.menuName).toBe('settings-menu');
      expect(result.menuType).toBe('settings');
      expect(result.country).toBe('PY');
      expect(result.maintenance_mode).toBe(true);
      expect(result.title).toBe('Settings Title');
      expect(result.description).toBe('Settings description');
      expect(result.locale).toBe('en');
    });

    it('should handle missing optional fields', () => {
      const apiData = { ...createApiData(), locale: undefined } as any;

      const result = StrapiAboutMeMenuMapper.toDomain(apiData);

      expect(result.id).toBe(1);
      expect(result.locale).toBeUndefined();
    });
  });

  describe('toDomainList', () => {
    it('should convert API response with multiple items', () => {
      const response = {
        data: [
          createApiData({ id: 1 }),
          createApiData({ id: 2 }),
          createApiData({ id: 3 }),
        ],
        meta: { pagination: { total: 3 } },
      };

      const result = StrapiAboutMeMenuMapper.toDomainList(response);

      expect(result).toHaveLength(3);
      expect(result[0]).toBeInstanceOf(StrapiAboutMeMenu);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(3);
    });

    it('should return empty array for empty data', () => {
      const response = { data: [], meta: {} };

      const result = StrapiAboutMeMenuMapper.toDomainList(response);

      expect(result).toEqual([]);
    });

    it('should preserve individual item properties', () => {
      const response = {
        data: [
          createApiData({ id: 1, country: 'CO', locale: 'es' }),
          createApiData({ id: 2, country: 'PY', locale: 'en' }),
        ],
        meta: {},
      };

      const result = StrapiAboutMeMenuMapper.toDomainList(response);

      expect(result[0].country).toBe('CO');
      expect(result[0].locale).toBe('es');
      expect(result[1].country).toBe('PY');
      expect(result[1].locale).toBe('en');
    });
  });

  describe('toDomainFromSingle', () => {
    it('should convert single API response to domain entity', () => {
      const response = {
        data: createApiData({ id: 10, menuName: 'dashboard' }),
        meta: {},
      };

      const result = StrapiAboutMeMenuMapper.toDomainFromSingle(response);

      expect(result).toBeInstanceOf(StrapiAboutMeMenu);
      expect(result.id).toBe(10);
      expect(result.menuName).toBe('dashboard');
    });

    it('should preserve locale in single response', () => {
      const response = {
        data: createApiData({ locale: 'pt' }),
        meta: {},
      };

      const result = StrapiAboutMeMenuMapper.toDomainFromSingle(response);

      expect(result.locale).toBe('pt');
    });
  });

  describe('static methods', () => {
    it('toDomain should be a static method', () => {
      expect(typeof StrapiAboutMeMenuMapper.toDomain).toBe('function');
    });

    it('toDomainList should be a static method', () => {
      expect(typeof StrapiAboutMeMenuMapper.toDomainList).toBe('function');
    });

    it('toDomainFromSingle should be a static method', () => {
      expect(typeof StrapiAboutMeMenuMapper.toDomainFromSingle).toBe(
        'function',
      );
    });
  });
});
