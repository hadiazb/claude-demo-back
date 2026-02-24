import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createE2eTestApp,
  closeTestApp,
  E2eTestApp,
} from '../helpers/test-app.helper';
import { registerUser, authHeader } from '../helpers/auth.e2e-helper';
import {
  strapiAboutMeMenuItems,
  buildStrapiApiListResponse,
} from '../fixtures/strapi.fixture';

const API = '/api/v1';

describe('Strapi About Me Menu (e2e)', () => {
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

    (testApp.mockHttpClient.get as jest.Mock).mockResolvedValue({
      data: buildStrapiApiListResponse(strapiAboutMeMenuItems),
      status: 200,
      statusText: 'OK',
      headers: {},
    });
  });

  describe('GET /strapi/about-me-menu', () => {
    it('should list all about me menu items', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API}/strapi/about-me-menu`)
        .set(authHeader(accessToken))
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(3);
    });

    it('should filter by country', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API}/strapi/about-me-menu?country=CO`)
        .set(authHeader(accessToken))
        .expect(200);

      expect(res.body.data.length).toBe(2);
      res.body.data.forEach((item: { country: string }) => {
        expect(item.country).toBe('CO');
      });
    });

    it('should filter by menuType', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API}/strapi/about-me-menu?menuType=contact`)
        .set(authHeader(accessToken))
        .expect(200);

      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].menuType).toBe('contact');
    });

    it('should return 401 without JWT', async () => {
      await request(app.getHttpServer())
        .get(`${API}/strapi/about-me-menu`)
        .expect(401);
    });
  });

  describe('GET /strapi/about-me-menu/:id', () => {
    it('should find item by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`${API}/strapi/about-me-menu/1`)
        .set(authHeader(accessToken))
        .expect(200);

      expect(res.body.data).toHaveProperty('id', 1);
      expect(res.body.data).toHaveProperty('menuName', 'About');
    });

    it('should return 404 for non-existent ID', async () => {
      await request(app.getHttpServer())
        .get(`${API}/strapi/about-me-menu/999`)
        .set(authHeader(accessToken))
        .expect(404);
    });
  });
});
