import { NotFoundException } from '@nestjs/common';
import { StrapiTabsMenuService } from '@strapi/application/services';
import { StrapiTabsMenuRepositoryPort } from '@strapi/domain/ports/out/strapi-tabs-menu.repository.port';
import { StrapiTabsMenu } from '@strapi/domain';

describe('StrapiTabsMenuService', () => {
  let service: StrapiTabsMenuService;
  let mockRepository: jest.Mocked<StrapiTabsMenuRepositoryPort>;

  const createMockRepository =
    (): jest.Mocked<StrapiTabsMenuRepositoryPort> => ({
      findAll: jest.fn(),
      findById: jest.fn(),
    });

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
    mockRepository = createMockRepository();
    service = new StrapiTabsMenuService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all tabs menu items', async () => {
      const items = [
        createTabsMenu({ id: 1, label: 'Home' }),
        createTabsMenu({ id: 2, label: 'Settings' }),
      ];
      mockRepository.findAll.mockResolvedValue(items);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it('should return empty array when no items', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should pass query params to repository', async () => {
      mockRepository.findAll.mockResolvedValue([]);
      const query = { locale: 'es', country: 'CO' };

      await service.findAll(query);

      expect(mockRepository.findAll).toHaveBeenCalledWith(query);
    });

    it('should call repository without params when none provided', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      await service.findAll();

      expect(mockRepository.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should propagate repository errors', async () => {
      mockRepository.findAll.mockRejectedValue(new Error('Connection error'));

      await expect(service.findAll()).rejects.toThrow('Connection error');
    });
  });

  describe('findById', () => {
    it('should return tabs menu item when found', async () => {
      const item = createTabsMenu({ id: 5, label: 'Profile' });
      mockRepository.findById.mockResolvedValue(item);

      const result = await service.findById(5);

      expect(result.id).toBe(5);
      expect(result.label).toBe('Profile');
    });

    it('should throw NotFoundException when item not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
      await expect(service.findById(999)).rejects.toThrow(
        "Tabs menu item with id '999' not found",
      );
    });

    it('should pass id and query to repository', async () => {
      const item = createTabsMenu();
      mockRepository.findById.mockResolvedValue(item);
      const query = { locale: 'en' };

      await service.findById(1, query);

      expect(mockRepository.findById).toHaveBeenCalledWith(1, query);
    });

    it('should call repository with correct id', async () => {
      const item = createTabsMenu();
      mockRepository.findById.mockResolvedValue(item);

      await service.findById(42);

      expect(mockRepository.findById).toHaveBeenCalledWith(42, undefined);
    });

    it('should propagate repository errors', async () => {
      mockRepository.findById.mockRejectedValue(
        new Error('Strapi unavailable'),
      );

      await expect(service.findById(1)).rejects.toThrow('Strapi unavailable');
    });
  });
});
