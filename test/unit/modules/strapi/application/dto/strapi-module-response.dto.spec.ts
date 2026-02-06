import { StrapiModuleResponseDto } from '@strapi/application/dto';
import { StrapiModule, StrapiModuleConfig } from '@strapi/domain';

describe('StrapiModuleResponseDto', () => {
  const createConfig = (
    overrides: Partial<StrapiModuleConfig> = {},
  ): StrapiModuleConfig => ({
    uid: 'module-uid-001',
    moduleName: 'test-module',
    title: { title: 'Test Title', show: true },
    moduleId: 'mod-001',
    description: 'Test description',
    country: ['CO'],
    actions: [{ name: 'action1', type: 'button' }],
    form_objects: [{ name: 'field1', type: 'text' }],
    formatting: { color: 'blue' },
    dataObjects: { backend: { url: '/api' }, frontend: { path: '/home' } },
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

  describe('fromDomain', () => {
    it('should create DTO from domain entity', () => {
      const module = createModule();

      const dto = StrapiModuleResponseDto.fromDomain(module);

      expect(dto).toBeInstanceOf(StrapiModuleResponseDto);
      expect(dto.documentId).toBe('doc-123');
      expect(dto.locale).toBe('es');
    });

    it('should map config correctly', () => {
      const config = createConfig({
        moduleName: 'my-module',
        country: ['CO', 'PY'],
      });
      const module = createModule({ config });

      const dto = StrapiModuleResponseDto.fromDomain(module);

      expect(dto.config.moduleName).toBe('my-module');
      expect(dto.config.country).toEqual(['CO', 'PY']);
      expect(dto.config.title).toEqual({ title: 'Test Title', show: true });
      expect(dto.config.uid).toBe('module-uid-001');
      expect(dto.config.moduleId).toBe('mod-001');
      expect(dto.config.description).toBe('Test description');
      expect(dto.config.actions).toEqual([{ name: 'action1', type: 'button' }]);
      expect(dto.config.form_objects).toEqual([
        { name: 'field1', type: 'text' },
      ]);
      expect(dto.config.dataObjects).toEqual({
        backend: { url: '/api' },
        frontend: { path: '/home' },
      });
    });

    it('should handle undefined locale', () => {
      const module = new StrapiModule('doc-123', createConfig());

      const dto = StrapiModuleResponseDto.fromDomain(module);

      expect(dto.locale).toBeUndefined();
    });

    it('should return a new DTO instance each time', () => {
      const module = createModule();

      const dto1 = StrapiModuleResponseDto.fromDomain(module);
      const dto2 = StrapiModuleResponseDto.fromDomain(module);

      expect(dto1).not.toBe(dto2);
      expect(dto1.documentId).toBe(dto2.documentId);
    });
  });
});
