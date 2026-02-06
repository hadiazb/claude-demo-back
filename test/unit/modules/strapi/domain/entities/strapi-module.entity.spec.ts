import { StrapiModule, StrapiModuleConfig } from '@strapi/domain';

describe('StrapiModule Entity', () => {
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

  describe('constructor', () => {
    it('should create an instance with all properties', () => {
      const config = createConfig();
      const module = new StrapiModule('doc-123', config, 'es');

      expect(module.documentId).toBe('doc-123');
      expect(module.config).toBe(config);
      expect(module.locale).toBe('es');
    });

    it('should create an instance without locale', () => {
      const config = createConfig();
      const module = new StrapiModule('doc-123', config);

      expect(module.documentId).toBe('doc-123');
      expect(module.config).toBe(config);
      expect(module.locale).toBeUndefined();
    });

    it('should preserve config structure with nested objects', () => {
      const config = createConfig({
        country: ['CO', 'PY'],
        actions: [
          { name: 'save', type: 'submit' },
          { name: 'cancel', type: 'button' },
        ],
      });
      const module = new StrapiModule('doc-456', config, 'en');

      expect(module.config.country).toEqual(['CO', 'PY']);
      expect(module.config.actions).toHaveLength(2);
      expect(module.config.title.title).toBe('Test Title');
      expect(module.config.title.show).toBe(true);
      expect(module.config.dataObjects.backend).toEqual({ url: '/api' });
    });

    it('should handle empty arrays in config', () => {
      const config = createConfig({
        country: [],
        actions: [],
        form_objects: [],
      });
      const module = new StrapiModule('doc-789', config);

      expect(module.config.country).toEqual([]);
      expect(module.config.actions).toEqual([]);
      expect(module.config.form_objects).toEqual([]);
    });

    it('should have readonly properties', () => {
      const config = createConfig();
      const module = new StrapiModule('doc-123', config, 'es');

      expect(module).toHaveProperty('documentId', 'doc-123');
      expect(module).toHaveProperty('config');
      expect(module).toHaveProperty('locale', 'es');
    });
  });

  describe('config properties', () => {
    it('should contain all required config fields', () => {
      const config = createConfig();
      const module = new StrapiModule('doc-123', config);

      expect(module.config.uid).toBeDefined();
      expect(module.config.moduleName).toBeDefined();
      expect(module.config.title).toBeDefined();
      expect(module.config.moduleId).toBeDefined();
      expect(module.config.description).toBeDefined();
      expect(module.config.country).toBeDefined();
      expect(module.config.actions).toBeDefined();
      expect(module.config.form_objects).toBeDefined();
      expect(module.config.dataObjects).toBeDefined();
    });

    it('should handle multiple countries', () => {
      const config = createConfig({
        country: ['CO', 'PY', 'BO', 'NI'],
      });
      const module = new StrapiModule('doc-123', config);

      expect(module.config.country).toHaveLength(4);
      expect(module.config.country).toContain('CO');
      expect(module.config.country).toContain('PY');
    });
  });
});
