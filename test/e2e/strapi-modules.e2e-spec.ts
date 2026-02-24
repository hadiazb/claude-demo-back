import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createE2eTestApp,
  closeTestApp,
  E2eTestApp,
} from '../helpers/test-app.helper';
import { registerUser, authHeader } from '../helpers/auth.e2e-helper';
import {
  strapiModuleItems,
  buildStrapiApiListResponse,
  buildStrapiApiSingleResponse,
} from '../fixtures/strapi.fixture';

const API = '/api/v1';

describe('Strapi Modules (e2e)', () => {
  let testApp: E2eTestApp;
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    testApp = await createE2eTestApp();
    app = testApp.app;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  beforeEach(async () => {
    testApp.reset();
    const result = await registerUser(app);
    accessToken = result.accessToken;

    // Configure mock HTTP client to return strapi module data
    (testApp.mockHttpClient.get as jest.Mock).mockResolvedValue({
      data: buildStrapiApiListResponse(strapiModuleItems),
      status: 200,
      statusText: 'OK',
      headers: {},
    });
  });

  describe('GET /strapi/modules', () => {
    it('should list all modules', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API}/strapi/modules`)
        .set(authHeader(accessToken))
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0]).toHaveProperty('documentId', 'mod-doc-1');
      expect(res.body.data[0].config).toHaveProperty('moduleName', 'portfolio');
    });

    it('should filter modules by country', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API}/strapi/modules?country=BO`)
        .set(authHeader(accessToken))
        .expect(200);

      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].config.moduleName).toBe('transfers');
    });

    it('should pass locale to Strapi API', async () => {
      await request(app.getHttpServer())
        .get(`${API}/strapi/modules?locale=en`)
        .set(authHeader(accessToken))
        .expect(200);

      expect(testApp.mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('api/modules'),
        expect.objectContaining({
          params: expect.objectContaining({ locale: 'en' }),
        }),
      );
    });

    it('should return 401 without JWT', async () => {
      await request(app.getHttpServer())
        .get(`${API}/strapi/modules`)
        .expect(401);
    });
  });

  describe('GET /strapi/modules/by-name/:moduleName', () => {
    it('should find module by name', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API}/strapi/modules/by-name/portfolio`)
        .set(authHeader(accessToken))
        .expect(200);

      expect(res.body.data).toHaveProperty('documentId', 'mod-doc-1');
      expect(res.body.data.config).toHaveProperty('moduleName', 'portfolio');
    });

    it('should return 404 for non-existent module name', async () => {
      await request(app.getHttpServer())
        .get(`${API}/strapi/modules/by-name/non-existent`)
        .set(authHeader(accessToken))
        .expect(404);
    });
  });

  describe('GET /strapi/modules/:documentId', () => {
    it('should find module by documentId', async () => {
      (testApp.mockHttpClient.get as jest.Mock).mockImplementation((url) => {
        if (url.includes('api/modules/mod-doc-1')) {
          return Promise.resolve({
            data: buildStrapiApiSingleResponse(strapiModuleItems[0]),
            status: 200,
            statusText: 'OK',
            headers: {},
          });
        }
        return Promise.resolve({
          data: buildStrapiApiListResponse(strapiModuleItems),
          status: 200,
          statusText: 'OK',
          headers: {},
        });
      });

      const res = await request(app.getHttpServer())
        .get(`${API}/strapi/modules/mod-doc-1`)
        .set(authHeader(accessToken))
        .expect(200);

      expect(res.body.data).toHaveProperty('documentId', 'mod-doc-1');
    });

    it('should return 404 for non-existent documentId', async () => {
      (testApp.mockHttpClient.get as jest.Mock).mockImplementation((url) => {
        if (url.includes('api/modules/non-existent')) {
          return Promise.reject(new Error('Not found'));
        }
        return Promise.resolve({
          data: buildStrapiApiListResponse(strapiModuleItems),
          status: 200,
          statusText: 'OK',
          headers: {},
        });
      });

      await request(app.getHttpServer())
        .get(`${API}/strapi/modules/non-existent`)
        .set(authHeader(accessToken))
        .expect(404);
    });
  });
});
