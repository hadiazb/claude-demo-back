import { StrapiTabsMenuResponseDto } from '@strapi/application/dto';
import { StrapiTabsMenu } from '@strapi/domain';

describe('StrapiTabsMenuResponseDto', () => {
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

  describe('fromDomain', () => {
    it('should create DTO from domain entity', () => {
      const tabsMenu = createTabsMenu({ locale: 'es' });

      const dto = StrapiTabsMenuResponseDto.fromDomain(tabsMenu);

      expect(dto).toBeInstanceOf(StrapiTabsMenuResponseDto);
      expect(dto.id).toBe(1);
      expect(dto.label).toBe('Home');
      expect(dto.locale).toBe('es');
    });

    it('should map all fields correctly', () => {
      const tabsMenu = createTabsMenu({
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
        fontSize: '16px',
        locale: 'en',
      });

      const dto = StrapiTabsMenuResponseDto.fromDomain(tabsMenu);

      expect(dto.id).toBe(5);
      expect(dto.label).toBe('Settings');
      expect(dto.enabled).toBe(false);
      expect(dto.icon).toBe('settings-icon');
      expect(dto.route).toBe('/settings');
      expect(dto.menuId).toBe('menu-005');
      expect(dto.menuName).toBe('settings-menu');
      expect(dto.menuType).toBe('sidebar');
      expect(dto.country).toBe('PY');
      expect(dto.description).toBe('Settings tab');
      expect(dto.fontSize).toBe('16px');
      expect(dto.locale).toBe('en');
    });

    it('should handle undefined optional fields', () => {
      const tabsMenu = createTabsMenu();

      const dto = StrapiTabsMenuResponseDto.fromDomain(tabsMenu);

      expect(dto.description).toBeUndefined();
      expect(dto.fontSize).toBeUndefined();
      expect(dto.locale).toBeUndefined();
    });

    it('should return a new DTO instance each time', () => {
      const tabsMenu = createTabsMenu();

      const dto1 = StrapiTabsMenuResponseDto.fromDomain(tabsMenu);
      const dto2 = StrapiTabsMenuResponseDto.fromDomain(tabsMenu);

      expect(dto1).not.toBe(dto2);
      expect(dto1.id).toBe(dto2.id);
    });
  });
});
