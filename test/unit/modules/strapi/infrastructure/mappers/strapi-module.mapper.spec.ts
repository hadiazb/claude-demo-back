import { StrapiModuleMapper } from '@strapi/infrastructure/mappers';
import { StrapiModule, StrapiModuleConfig } from '@strapi/domain';

describe('StrapiModuleMapper', () => {
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

  const createApiData = (
    overrides: Partial<{
      documentId: string;
      locale: string;
      config: StrapiModuleConfig;
    }> = {},
  ) => ({
    documentId: overrides.documentId || 'doc-123',
    locale: overrides.locale || 'es',
    config: overrides.config || createConfig(),
  });

  describe('toDomain', () => {
    it('should convert API data to domain entity', () => {
      const apiData = createApiData();

      const result = StrapiModuleMapper.toDomain(apiData);

      expect(result).toBeInstanceOf(StrapiModule);
      expect(result.documentId).toBe('doc-123');
      expect(result.locale).toBe('es');
      expect(result.config.moduleName).toBe('test-module');
    });

    it('should preserve all config properties', () => {
      const config = createConfig({
        country: ['CO', 'PY'],
        actions: [{ name: 'save' }, { name: 'cancel' }],
      });
      const apiData = createApiData({ config });

      const result = StrapiModuleMapper.toDomain(apiData);

      expect(result.config.country).toEqual(['CO', 'PY']);
      expect(result.config.actions).toHaveLength(2);
      expect(result.config.title).toEqual({ title: 'Test Title', show: true });
      expect(result.config.dataObjects).toEqual({
        backend: { url: '/api' },
        frontend: { path: '/home' },
      });
    });

    it('should handle missing locale', () => {
      const apiData = { documentId: 'doc-123', config: createConfig() };

      const result = StrapiModuleMapper.toDomain(apiData as any);

      expect(result.documentId).toBe('doc-123');
      expect(result.locale).toBeUndefined();
    });
  });

  describe('toDomainList', () => {
    it('should convert API response with multiple items', () => {
      const response = {
        data: [
          createApiData({ documentId: 'doc-1' }),
          createApiData({ documentId: 'doc-2' }),
          createApiData({ documentId: 'doc-3' }),
        ],
        meta: { pagination: { total: 3 } },
      };

      const result = StrapiModuleMapper.toDomainList(response);

      expect(result).toHaveLength(3);
      expect(result[0]).toBeInstanceOf(StrapiModule);
      expect(result[0].documentId).toBe('doc-1');
      expect(result[1].documentId).toBe('doc-2');
      expect(result[2].documentId).toBe('doc-3');
    });

    it('should return empty array for empty data', () => {
      const response = { data: [], meta: {} };

      const result = StrapiModuleMapper.toDomainList(response);

      expect(result).toEqual([]);
    });

    it('should preserve individual item properties', () => {
      const configCO = createConfig({ country: ['CO'], moduleName: 'mod-co' });
      const configPY = createConfig({ country: ['PY'], moduleName: 'mod-py' });
      const response = {
        data: [
          createApiData({
            documentId: 'doc-1',
            config: configCO,
            locale: 'es',
          }),
          createApiData({
            documentId: 'doc-2',
            config: configPY,
            locale: 'en',
          }),
        ],
        meta: {},
      };

      const result = StrapiModuleMapper.toDomainList(response);

      expect(result[0].config.country).toEqual(['CO']);
      expect(result[0].locale).toBe('es');
      expect(result[1].config.country).toEqual(['PY']);
      expect(result[1].locale).toBe('en');
    });
  });

  describe('toDomainFromSingle', () => {
    it('should convert single API response to domain entity', () => {
      const response = {
        data: createApiData({ documentId: 'doc-single' }),
        meta: {},
      };

      const result = StrapiModuleMapper.toDomainFromSingle(response);

      expect(result).toBeInstanceOf(StrapiModule);
      expect(result.documentId).toBe('doc-single');
      expect(result.config.moduleName).toBe('test-module');
    });

    it('should preserve locale in single response', () => {
      const response = {
        data: createApiData({ locale: 'pt' }),
        meta: {},
      };

      const result = StrapiModuleMapper.toDomainFromSingle(response);

      expect(result.locale).toBe('pt');
    });
  });

  describe('static methods', () => {
    it('toDomain should be a static method', () => {
      expect(typeof StrapiModuleMapper.toDomain).toBe('function');
    });

    it('toDomainList should be a static method', () => {
      expect(typeof StrapiModuleMapper.toDomainList).toBe('function');
    });

    it('toDomainFromSingle should be a static method', () => {
      expect(typeof StrapiModuleMapper.toDomainFromSingle).toBe('function');
    });
  });
});
