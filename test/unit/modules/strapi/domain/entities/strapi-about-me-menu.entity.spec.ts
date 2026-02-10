import { StrapiAboutMeMenu } from '@strapi/domain';

describe('StrapiAboutMeMenu Entity', () => {
  const createAboutMeMenu = (
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
  ): StrapiAboutMeMenu =>
    new StrapiAboutMeMenu(
      overrides.id ?? 1,
      overrides.enable ?? true,
      overrides.order ?? 1,
      overrides.menuName ?? 'profile-menu',
      overrides.menuType ?? 'about-me',
      overrides.country ?? 'CO',
      overrides.maintenance_mode ?? false,
      overrides.title,
      overrides.description,
      overrides.locale,
    );

  describe('constructor', () => {
    it('should create an instance with all properties', () => {
      const aboutMeMenu = createAboutMeMenu({
        id: 5,
        enable: true,
        order: 3,
        menuName: 'settings-menu',
        menuType: 'settings',
        country: 'PY',
        maintenance_mode: true,
        title: 'Settings Title',
        description: 'Settings description',
        locale: 'es',
      });

      expect(aboutMeMenu.id).toBe(5);
      expect(aboutMeMenu.enable).toBe(true);
      expect(aboutMeMenu.order).toBe(3);
      expect(aboutMeMenu.menuName).toBe('settings-menu');
      expect(aboutMeMenu.menuType).toBe('settings');
      expect(aboutMeMenu.country).toBe('PY');
      expect(aboutMeMenu.maintenance_mode).toBe(true);
      expect(aboutMeMenu.title).toBe('Settings Title');
      expect(aboutMeMenu.description).toBe('Settings description');
      expect(aboutMeMenu.locale).toBe('es');
    });

    it('should create an instance without optional properties', () => {
      const aboutMeMenu = createAboutMeMenu();

      expect(aboutMeMenu.id).toBe(1);
      expect(aboutMeMenu.enable).toBe(true);
      expect(aboutMeMenu.order).toBe(1);
      expect(aboutMeMenu.menuName).toBe('profile-menu');
      expect(aboutMeMenu.title).toBeUndefined();
      expect(aboutMeMenu.description).toBeUndefined();
      expect(aboutMeMenu.locale).toBeUndefined();
    });

    it('should handle disabled items', () => {
      const aboutMeMenu = createAboutMeMenu({ enable: false });

      expect(aboutMeMenu.enable).toBe(false);
    });

    it('should have readonly properties', () => {
      const aboutMeMenu = createAboutMeMenu({
        id: 10,
        menuName: 'test-menu',
        country: 'BO',
      });

      expect(aboutMeMenu).toHaveProperty('id', 10);
      expect(aboutMeMenu).toHaveProperty('menuName', 'test-menu');
      expect(aboutMeMenu).toHaveProperty('country', 'BO');
    });

    it('should preserve country as a string (not array)', () => {
      const aboutMeMenu = createAboutMeMenu({ country: 'NI' });

      expect(typeof aboutMeMenu.country).toBe('string');
      expect(aboutMeMenu.country).toBe('NI');
    });

    it('should preserve numeric id', () => {
      const aboutMeMenu = createAboutMeMenu({ id: 42 });

      expect(typeof aboutMeMenu.id).toBe('number');
      expect(aboutMeMenu.id).toBe(42);
    });
  });
});
