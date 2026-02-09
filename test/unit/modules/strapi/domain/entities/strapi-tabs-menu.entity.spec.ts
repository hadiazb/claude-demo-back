import { StrapiTabsMenu } from '@strapi/domain';

describe('StrapiTabsMenu Entity', () => {
  const createTabsMenu = (
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
  ): StrapiTabsMenu =>
    new StrapiTabsMenu(
      overrides.id ?? 1,
      overrides.label ?? 'Home',
      overrides.enabled ?? true,
      overrides.icon ?? 'home-icon',
      overrides.route ?? '/home',
      overrides.menuId ?? 'menu-001',
      overrides.menuName ?? 'main-menu',
      overrides.menuType ?? 'tabs',
      overrides.country ?? 'CO',
      overrides.description,
      overrides.fontSize,
      overrides.locale,
    );

  describe('constructor', () => {
    it('should create an instance with all properties', () => {
      const tabsMenu = createTabsMenu({
        id: 5,
        label: 'Settings',
        enabled: true,
        icon: 'settings-icon',
        route: '/settings',
        menuId: 'menu-005',
        menuName: 'settings-menu',
        menuType: 'sidebar',
        country: 'PY',
        description: 'Settings tab',
        fontSize: '14px',
        locale: 'es',
      });

      expect(tabsMenu.id).toBe(5);
      expect(tabsMenu.label).toBe('Settings');
      expect(tabsMenu.enabled).toBe(true);
      expect(tabsMenu.icon).toBe('settings-icon');
      expect(tabsMenu.route).toBe('/settings');
      expect(tabsMenu.menuId).toBe('menu-005');
      expect(tabsMenu.menuName).toBe('settings-menu');
      expect(tabsMenu.menuType).toBe('sidebar');
      expect(tabsMenu.country).toBe('PY');
      expect(tabsMenu.description).toBe('Settings tab');
      expect(tabsMenu.fontSize).toBe('14px');
      expect(tabsMenu.locale).toBe('es');
    });

    it('should create an instance without optional properties', () => {
      const tabsMenu = createTabsMenu();

      expect(tabsMenu.id).toBe(1);
      expect(tabsMenu.label).toBe('Home');
      expect(tabsMenu.enabled).toBe(true);
      expect(tabsMenu.description).toBeUndefined();
      expect(tabsMenu.fontSize).toBeUndefined();
      expect(tabsMenu.locale).toBeUndefined();
    });

    it('should handle disabled tabs', () => {
      const tabsMenu = createTabsMenu({ enabled: false });

      expect(tabsMenu.enabled).toBe(false);
    });

    it('should have readonly properties', () => {
      const tabsMenu = createTabsMenu({
        id: 10,
        label: 'Profile',
        country: 'BO',
      });

      expect(tabsMenu).toHaveProperty('id', 10);
      expect(tabsMenu).toHaveProperty('label', 'Profile');
      expect(tabsMenu).toHaveProperty('country', 'BO');
    });

    it('should preserve country as a string (not array)', () => {
      const tabsMenu = createTabsMenu({ country: 'NI' });

      expect(typeof tabsMenu.country).toBe('string');
      expect(tabsMenu.country).toBe('NI');
    });

    it('should preserve numeric id', () => {
      const tabsMenu = createTabsMenu({ id: 42 });

      expect(typeof tabsMenu.id).toBe('number');
      expect(tabsMenu.id).toBe(42);
    });
  });
});
