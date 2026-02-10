import { NotFoundException } from '@nestjs/common';
import { StrapiAboutMeMenuService } from '@strapi/application/services';
import { StrapiAboutMeMenuRepositoryPort } from '@strapi/domain/ports/out/strapi-about-me-menu.repository.port';
import { StrapiAboutMeMenu } from '@strapi/domain';

describe('StrapiAboutMeMenuService', () => {
  let service: StrapiAboutMeMenuService;
  let mockRepository: jest.Mocked<StrapiAboutMeMenuRepositoryPort>;

  const createMockRepository =
    (): jest.Mocked<StrapiAboutMeMenuRepositoryPort> => ({
      findAll: jest.fn(),
      findById: jest.fn(),
    });

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
    mockRepository = createMockRepository();
    service = new StrapiAboutMeMenuService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all about me menu items', async () => {
      const items = [
        createAboutMeMenu({ id: 1, menuName: 'profile' }),
        createAboutMeMenu({ id: 2, menuName: 'settings' }),
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
    it('should return about me menu item when found', async () => {
      const item = createAboutMeMenu({ id: 5, menuName: 'profile' });
      mockRepository.findById.mockResolvedValue(item);

      const result = await service.findById(5);

      expect(result.id).toBe(5);
      expect(result.menuName).toBe('profile');
    });

    it('should throw NotFoundException when item not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
      await expect(service.findById(999)).rejects.toThrow(
        "About me menu item with id '999' not found",
      );
    });

    it('should pass id and query to repository', async () => {
      const item = createAboutMeMenu();
      mockRepository.findById.mockResolvedValue(item);
      const query = { locale: 'en' };

      await service.findById(1, query);

      expect(mockRepository.findById).toHaveBeenCalledWith(1, query);
    });

    it('should call repository with correct id', async () => {
      const item = createAboutMeMenu();
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
