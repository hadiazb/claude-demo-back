import { NotFoundException } from '@nestjs/common';
import { StrapiTabsMenuController } from '@strapi/infrastructure/adapters';
import { StrapiTabsMenuService } from '@strapi/application/services';
import { StrapiTabsMenuResponseDto } from '@strapi/application/dto';
import { StrapiTabsMenu } from '@strapi/domain';

describe('StrapiTabsMenuController', () => {
  let controller: StrapiTabsMenuController;
  let mockService: jest.Mocked<StrapiTabsMenuService>;

  const createMockService = (): jest.Mocked<StrapiTabsMenuService> =>
    ({
      findAll: jest.fn(),
      findById: jest.fn(),
    }) as unknown as jest.Mocked<StrapiTabsMenuService>;

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

  beforeEach(() => {
    mockService = createMockService();
    controller = new StrapiTabsMenuController(mockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return array of StrapiTabsMenuResponseDto', async () => {
      const items = [
        createTabsMenu({ id: 1, label: 'Home' }),
        createTabsMenu({ id: 2, label: 'Settings' }),
      ];
      mockService.findAll.mockResolvedValue(items);

      const result = await controller.findAll({});

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(StrapiTabsMenuResponseDto);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it('should return empty array when no items', async () => {
      mockService.findAll.mockResolvedValue([]);

      const result = await controller.findAll({});

      expect(result).toEqual([]);
    });

    it('should pass query params to service', async () => {
      mockService.findAll.mockResolvedValue([]);
      const query = { locale: 'es', country: 'CO' };

      await controller.findAll(query);

      expect(mockService.findAll).toHaveBeenCalledWith(query);
    });

    it('should pass menuType filter to service', async () => {
      mockService.findAll.mockResolvedValue([]);
      const query = { locale: 'es', menuType: 'tabs' };

      await controller.findAll(query);

      expect(mockService.findAll).toHaveBeenCalledWith(query);
    });

    it('should map domain entities to DTOs correctly', async () => {
      const items = [
        createTabsMenu({
          id: 3,
          label: 'Profile',
          country: 'PY',
          locale: 'en',
        }),
      ];
      mockService.findAll.mockResolvedValue(items);

      const result = await controller.findAll({});

      expect(result[0].label).toBe('Profile');
      expect(result[0].country).toBe('PY');
      expect(result[0].locale).toBe('en');
    });

    it('should propagate service errors', async () => {
      mockService.findAll.mockRejectedValue(new Error('Service error'));

      await expect(controller.findAll({})).rejects.toThrow('Service error');
    });
  });

  describe('findOne', () => {
    it('should return StrapiTabsMenuResponseDto when found', async () => {
      const item = createTabsMenu({ id: 5, label: 'Dashboard' });
      mockService.findById.mockResolvedValue(item);

      const result = await controller.findOne(5, {});

      expect(result).toBeInstanceOf(StrapiTabsMenuResponseDto);
      expect(result.id).toBe(5);
      expect(result.label).toBe('Dashboard');
    });

    it('should pass id and query to service', async () => {
      const item = createTabsMenu();
      mockService.findById.mockResolvedValue(item);
      const query = { locale: 'pt' };

      await controller.findOne(1, query);

      expect(mockService.findById).toHaveBeenCalledWith(1, query);
    });

    it('should propagate NotFoundException from service', async () => {
      mockService.findById.mockRejectedValue(
        new NotFoundException("Tabs menu item with id '999' not found"),
      );

      await expect(controller.findOne(999, {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return DTO with all fields mapped', async () => {
      const item = createTabsMenu({
        id: 10,
        label: 'Reports',
        enabled: false,
        icon: 'report-icon',
        route: '/reports',
        menuId: 'menu-010',
        menuName: 'report-menu',
        menuType: 'sidebar',
        country: 'BO',
        description: 'Reports section',
        fontSize: '14px',
        locale: 'es',
      });
      mockService.findById.mockResolvedValue(item);

      const result = await controller.findOne(10, {});

      expect(result.id).toBe(10);
      expect(result.label).toBe('Reports');
      expect(result.enabled).toBe(false);
      expect(result.icon).toBe('report-icon');
      expect(result.route).toBe('/reports');
      expect(result.menuId).toBe('menu-010');
      expect(result.menuName).toBe('report-menu');
      expect(result.menuType).toBe('sidebar');
      expect(result.country).toBe('BO');
      expect(result.description).toBe('Reports section');
      expect(result.fontSize).toBe('14px');
    });
  });
});
