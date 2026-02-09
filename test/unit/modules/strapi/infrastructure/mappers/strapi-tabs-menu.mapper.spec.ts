import { StrapiTabsMenuMapper } from '@strapi/infrastructure/mappers';
import { StrapiTabsMenu } from '@strapi/domain';

describe('StrapiTabsMenuMapper', () => {
  const createApiData = (
    overrides: Partial<{
      id: number;
      label: string;
      enabled: boolean;
      icon: string;
      route: string;
      menuId: string;
      menuName: string;
      menuType: string;
      country: string;
      description: string;
      fontSize: string;
      locale: string;
    }> = {},
  ) => ({
    id: overrides.id ?? 1,
    label: overrides.label ?? 'Home',
    enabled: overrides.enabled ?? true,
    icon: overrides.icon ?? 'home-icon',
    route: overrides.route ?? '/home',
    menuId: overrides.menuId ?? 'menu-001',
    menuName: overrides.menuName ?? 'main-menu',
    menuType: overrides.menuType ?? 'tabs',
    country: overrides.country ?? 'CO',
    description: overrides.description,
    fontSize: overrides.fontSize,
    locale: overrides.locale ?? 'es',
  });

  describe('toDomain', () => {
    it('should convert API data to domain entity', () => {
      const apiData = createApiData();

      const result = StrapiTabsMenuMapper.toDomain(apiData);

      expect(result).toBeInstanceOf(StrapiTabsMenu);
      expect(result.id).toBe(1);
      expect(result.label).toBe('Home');
      expect(result.locale).toBe('es');
    });

    it('should preserve all properties', () => {
      const apiData = createApiData({
        id: 5,
        label: 'Settings',
        enabled: false,
        icon: 'settings-icon',
        route: '/settings',
        menuId: 'menu-005',
        menuName: 'settings-menu',
        menuType: 'sidebar',
        country: 'PY',
        description: 'Settings tab',
        fontSize: '14px',
        locale: 'en',
      });

      const result = StrapiTabsMenuMapper.toDomain(apiData);

      expect(result.id).toBe(5);
      expect(result.label).toBe('Settings');
      expect(result.enabled).toBe(false);
      expect(result.icon).toBe('settings-icon');
      expect(result.route).toBe('/settings');
      expect(result.menuId).toBe('menu-005');
      expect(result.menuName).toBe('settings-menu');
      expect(result.menuType).toBe('sidebar');
      expect(result.country).toBe('PY');
      expect(result.description).toBe('Settings tab');
      expect(result.fontSize).toBe('14px');
      expect(result.locale).toBe('en');
    });

    it('should handle missing optional fields', () => {
      const apiData = { ...createApiData(), locale: undefined } as any;

      const result = StrapiTabsMenuMapper.toDomain(apiData);

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

      const result = StrapiTabsMenuMapper.toDomainList(response);

      expect(result).toHaveLength(3);
      expect(result[0]).toBeInstanceOf(StrapiTabsMenu);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(3);
    });

    it('should return empty array for empty data', () => {
      const response = { data: [], meta: {} };

      const result = StrapiTabsMenuMapper.toDomainList(response);

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

      const result = StrapiTabsMenuMapper.toDomainList(response);

      expect(result[0].country).toBe('CO');
      expect(result[0].locale).toBe('es');
      expect(result[1].country).toBe('PY');
      expect(result[1].locale).toBe('en');
    });
  });

  describe('toDomainFromSingle', () => {
    it('should convert single API response to domain entity', () => {
      const response = {
        data: createApiData({ id: 10, label: 'Dashboard' }),
        meta: {},
      };

      const result = StrapiTabsMenuMapper.toDomainFromSingle(response);

      expect(result).toBeInstanceOf(StrapiTabsMenu);
      expect(result.id).toBe(10);
      expect(result.label).toBe('Dashboard');
    });

    it('should preserve locale in single response', () => {
      const response = {
        data: createApiData({ locale: 'pt' }),
        meta: {},
      };

      const result = StrapiTabsMenuMapper.toDomainFromSingle(response);

      expect(result.locale).toBe('pt');
    });
  });

  describe('static methods', () => {
    it('toDomain should be a static method', () => {
      expect(typeof StrapiTabsMenuMapper.toDomain).toBe('function');
    });

    it('toDomainList should be a static method', () => {
      expect(typeof StrapiTabsMenuMapper.toDomainList).toBe('function');
    });

    it('toDomainFromSingle should be a static method', () => {
      expect(typeof StrapiTabsMenuMapper.toDomainFromSingle).toBe('function');
    });
  });
});
