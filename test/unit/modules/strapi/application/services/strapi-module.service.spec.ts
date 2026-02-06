import { NotFoundException } from '@nestjs/common';
import { StrapiModuleService } from '@strapi/application/services';
import { StrapiModuleRepositoryPort } from '@strapi/domain/ports/out/strapi-module.repository.port';
import { StrapiModule, StrapiModuleConfig } from '@strapi/domain';

describe('StrapiModuleService', () => {
  let service: StrapiModuleService;
  let mockRepository: jest.Mocked<StrapiModuleRepositoryPort>;

  const createMockRepository = (): jest.Mocked<StrapiModuleRepositoryPort> => ({
    findAll: jest.fn(),
    findByDocumentId: jest.fn(),
    findByModuleName: jest.fn(),
  });

  const createConfig = (
    overrides: Partial<StrapiModuleConfig> = {},
  ): StrapiModuleConfig => ({
    uid: 'module-uid-001',
    moduleName: 'test-module',
    title: { title: 'Test Title', show: true },
    moduleId: 'mod-001',
    description: 'Test description',
    country: ['CO'],
    actions: [],
    form_objects: [],
    formatting: null,
    dataObjects: { backend: null, frontend: null },
    ...overrides,
  });

  const createModule = (
    overrides: Partial<{
      documentId: string;
      config: StrapiModuleConfig;
      locale: string;
    }> = {},
  ): StrapiModule =>
    new StrapiModule(
      overrides.documentId || 'doc-123',
      overrides.config || createConfig(),
      overrides.locale || 'es',
    );

  beforeEach(() => {
    mockRepository = createMockRepository();
    service = new StrapiModuleService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all modules', async () => {
      const modules = [
        createModule({ documentId: 'doc-1' }),
        createModule({ documentId: 'doc-2' }),
      ];
      mockRepository.findAll.mockResolvedValue(modules);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].documentId).toBe('doc-1');
      expect(result[1].documentId).toBe('doc-2');
    });

    it('should return empty array when no modules', async () => {
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

  describe('findByDocumentId', () => {
    it('should return module when found', async () => {
      const module = createModule({ documentId: 'doc-found' });
      mockRepository.findByDocumentId.mockResolvedValue(module);

      const result = await service.findByDocumentId('doc-found');

      expect(result.documentId).toBe('doc-found');
    });

    it('should throw NotFoundException when module not found', async () => {
      mockRepository.findByDocumentId.mockResolvedValue(null);

      await expect(service.findByDocumentId('doc-missing')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByDocumentId('doc-missing')).rejects.toThrow(
        "Module with documentId 'doc-missing' not found",
      );
    });

    it('should pass documentId and query to repository', async () => {
      const module = createModule();
      mockRepository.findByDocumentId.mockResolvedValue(module);
      const query = { locale: 'en' };

      await service.findByDocumentId('doc-123', query);

      expect(mockRepository.findByDocumentId).toHaveBeenCalledWith(
        'doc-123',
        query,
      );
    });

    it('should call repository with correct documentId', async () => {
      const module = createModule();
      mockRepository.findByDocumentId.mockResolvedValue(module);

      await service.findByDocumentId('specific-doc-id');

      expect(mockRepository.findByDocumentId).toHaveBeenCalledWith(
        'specific-doc-id',
        undefined,
      );
    });
  });

  describe('findByModuleName', () => {
    it('should return module when found', async () => {
      const module = createModule({
        config: createConfig({ moduleName: 'my-module' }),
      });
      mockRepository.findByModuleName.mockResolvedValue(module);

      const result = await service.findByModuleName('my-module');

      expect(result.config.moduleName).toBe('my-module');
    });

    it('should throw NotFoundException when module not found', async () => {
      mockRepository.findByModuleName.mockResolvedValue(null);

      await expect(service.findByModuleName('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findByModuleName('non-existent')).rejects.toThrow(
        "Module with moduleName 'non-existent' not found",
      );
    });

    it('should pass moduleName and query to repository', async () => {
      const module = createModule();
      mockRepository.findByModuleName.mockResolvedValue(module);
      const query = { locale: 'es', country: 'CO' };

      await service.findByModuleName('test-module', query);

      expect(mockRepository.findByModuleName).toHaveBeenCalledWith(
        'test-module',
        query,
      );
    });

    it('should propagate repository errors', async () => {
      mockRepository.findByModuleName.mockRejectedValue(
        new Error('Strapi unavailable'),
      );

      await expect(service.findByModuleName('test-module')).rejects.toThrow(
        'Strapi unavailable',
      );
    });
  });
});
