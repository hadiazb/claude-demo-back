import { NotFoundException } from '@nestjs/common';
import { StrapiAboutMeMenuController } from '@strapi/infrastructure/adapters';
import { StrapiAboutMeMenuService } from '@strapi/application/services';
import { StrapiAboutMeMenuResponseDto } from '@strapi/application/dto';
import { StrapiAboutMeMenu } from '@strapi/domain';

describe('StrapiAboutMeMenuController', () => {
  let controller: StrapiAboutMeMenuController;
  let mockService: jest.Mocked<StrapiAboutMeMenuService>;

  const createMockService = (): jest.Mocked<StrapiAboutMeMenuService> =>
    ({
      findAll: jest.fn(),
      findById: jest.fn(),
    }) as unknown as jest.Mocked<StrapiAboutMeMenuService>;

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

  beforeEach(() => {
    mockService = createMockService();
    controller = new StrapiAboutMeMenuController(mockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return array of StrapiAboutMeMenuResponseDto', async () => {
      const items = [
        createAboutMeMenu({ id: 1, menuName: 'profile' }),
        createAboutMeMenu({ id: 2, menuName: 'settings' }),
      ];
      mockService.findAll.mockResolvedValue(items);

      const result = await controller.findAll({});

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(StrapiAboutMeMenuResponseDto);
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
      const query = { locale: 'es', menuType: 'about-me' };

      await controller.findAll(query);

      expect(mockService.findAll).toHaveBeenCalledWith(query);
    });

    it('should map domain entities to DTOs correctly', async () => {
      const items = [
        createAboutMeMenu({
          id: 3,
          menuName: 'profile',
          country: 'PY',
          locale: 'en',
        }),
      ];
      mockService.findAll.mockResolvedValue(items);

      const result = await controller.findAll({});

      expect(result[0].menuName).toBe('profile');
      expect(result[0].country).toBe('PY');
      expect(result[0].locale).toBe('en');
    });

    it('should propagate service errors', async () => {
      mockService.findAll.mockRejectedValue(new Error('Service error'));

      await expect(controller.findAll({})).rejects.toThrow('Service error');
    });
  });

  describe('findOne', () => {
    it('should return StrapiAboutMeMenuResponseDto when found', async () => {
      const item = createAboutMeMenu({ id: 5, menuName: 'dashboard' });
      mockService.findById.mockResolvedValue(item);

      const result = await controller.findOne(5, {});

      expect(result).toBeInstanceOf(StrapiAboutMeMenuResponseDto);
      expect(result.id).toBe(5);
      expect(result.menuName).toBe('dashboard');
    });

    it('should pass id and query to service', async () => {
      const item = createAboutMeMenu();
      mockService.findById.mockResolvedValue(item);
      const query = { locale: 'pt' };

      await controller.findOne(1, query);

      expect(mockService.findById).toHaveBeenCalledWith(1, query);
    });

    it('should propagate NotFoundException from service', async () => {
      mockService.findById.mockRejectedValue(
        new NotFoundException("About me menu item with id '999' not found"),
      );

      await expect(controller.findOne(999, {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return DTO with all fields mapped', async () => {
      const item = createAboutMeMenu({
        id: 10,
        enable: false,
        order: 5,
        menuName: 'reports-menu',
        menuType: 'reports',
        country: 'BO',
        maintenance_mode: true,
        title: 'Reports Title',
        description: 'Reports section',
        locale: 'es',
      });
      mockService.findById.mockResolvedValue(item);

      const result = await controller.findOne(10, {});

      expect(result.id).toBe(10);
      expect(result.enable).toBe(false);
      expect(result.order).toBe(5);
      expect(result.menuName).toBe('reports-menu');
      expect(result.menuType).toBe('reports');
      expect(result.country).toBe('BO');
      expect(result.maintenance_mode).toBe(true);
      expect(result.title).toBe('Reports Title');
      expect(result.description).toBe('Reports section');
    });
  });
});
