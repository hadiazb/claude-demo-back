import { NotFoundException } from '@nestjs/common';
import { StrapiModuleController } from '@strapi/infrastructure/adapters';
import { StrapiModuleService } from '@strapi/application/services';
import { StrapiModuleResponseDto } from '@strapi/application/dto';
import { StrapiModule, StrapiModuleConfig } from '@strapi/domain';

describe('StrapiModuleController', () => {
  let controller: StrapiModuleController;
  let mockService: jest.Mocked<StrapiModuleService>;

  const createMockService = (): jest.Mocked<StrapiModuleService> =>
    ({
      findAll: jest.fn(),
      findByDocumentId: jest.fn(),
      findByModuleName: jest.fn(),
    }) as unknown as jest.Mocked<StrapiModuleService>;

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
    mockService = createMockService();
    controller = new StrapiModuleController(mockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return array of StrapiModuleResponseDto', async () => {
      const modules = [
        createModule({ documentId: 'doc-1' }),
        createModule({ documentId: 'doc-2' }),
      ];
      mockService.findAll.mockResolvedValue(modules);

      const result = await controller.findAll({});

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(StrapiModuleResponseDto);
      expect(result[0].documentId).toBe('doc-1');
      expect(result[1].documentId).toBe('doc-2');
    });

    it('should return empty array when no modules', async () => {
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

    it('should map domain entities to DTOs with config', async () => {
      const config = createConfig({
        moduleName: 'mapped-module',
        country: ['PY'],
      });
      const modules = [createModule({ config, locale: 'en' })];
      mockService.findAll.mockResolvedValue(modules);

      const result = await controller.findAll({});

      expect(result[0].config.moduleName).toBe('mapped-module');
      expect(result[0].config.country).toEqual(['PY']);
      expect(result[0].locale).toBe('en');
    });

    it('should propagate service errors', async () => {
      mockService.findAll.mockRejectedValue(new Error('Service error'));

      await expect(controller.findAll({})).rejects.toThrow('Service error');
    });
  });

  describe('findByModuleName', () => {
    it('should return StrapiModuleResponseDto when found', async () => {
      const module = createModule({
        config: createConfig({ moduleName: 'my-module' }),
      });
      mockService.findByModuleName.mockResolvedValue(module);

      const result = await controller.findByModuleName('my-module', {});

      expect(result).toBeInstanceOf(StrapiModuleResponseDto);
      expect(result.config.moduleName).toBe('my-module');
    });

    it('should pass moduleName and query to service', async () => {
      const module = createModule();
      mockService.findByModuleName.mockResolvedValue(module);
      const query = { country: 'CO' };

      await controller.findByModuleName('test-module', query);

      expect(mockService.findByModuleName).toHaveBeenCalledWith(
        'test-module',
        query,
      );
    });

    it('should propagate NotFoundException from service', async () => {
      mockService.findByModuleName.mockRejectedValue(
        new NotFoundException("Module with moduleName 'missing' not found"),
      );

      await expect(controller.findByModuleName('missing', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return StrapiModuleResponseDto when found', async () => {
      const module = createModule({ documentId: 'doc-found' });
      mockService.findByDocumentId.mockResolvedValue(module);

      const result = await controller.findOne('doc-found', {});

      expect(result).toBeInstanceOf(StrapiModuleResponseDto);
      expect(result.documentId).toBe('doc-found');
    });

    it('should pass documentId and query to service', async () => {
      const module = createModule();
      mockService.findByDocumentId.mockResolvedValue(module);
      const query = { locale: 'pt' };

      await controller.findOne('doc-123', query);

      expect(mockService.findByDocumentId).toHaveBeenCalledWith(
        'doc-123',
        query,
      );
    });

    it('should propagate NotFoundException from service', async () => {
      mockService.findByDocumentId.mockRejectedValue(
        new NotFoundException("Module with documentId 'missing' not found"),
      );

      await expect(controller.findOne('missing', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return DTO with correct config structure', async () => {
      const config = createConfig({
        uid: 'uid-test',
        moduleId: 'mid-test',
        title: { title: 'Custom', show: false },
      });
      const module = createModule({ documentId: 'doc-cfg', config });
      mockService.findByDocumentId.mockResolvedValue(module);

      const result = await controller.findOne('doc-cfg', {});

      expect(result.config.uid).toBe('uid-test');
      expect(result.config.moduleId).toBe('mid-test');
      expect(result.config.title).toEqual({ title: 'Custom', show: false });
    });
  });
});
