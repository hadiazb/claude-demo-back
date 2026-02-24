import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createE2eTestApp,
  closeTestApp,
  E2eTestApp,
} from '../helpers/test-app.helper';
import { registerUser, authHeader } from '../helpers/auth.e2e-helper';

const API = '/api/v1';
const WEBHOOK_SECRET = 'test-webhook-secret';

describe('Strapi Webhook (e2e)', () => {
  let testApp: E2eTestApp;
  let app: INestApplication;

  beforeAll(async () => {
    testApp = await createE2eTestApp();
    app = testApp.app;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  beforeEach(() => {
    testApp.reset();
  });

  describe('POST /strapi/webhook/cache-invalidation', () => {
    it('should invalidate cache with correct secret', async () => {
      const res = await request(app.getHttpServer())
        .post(`${API}/strapi/webhook/cache-invalidation`)
        .set('x-webhook-secret', WEBHOOK_SECRET)
        .send({ event: 'entry.update', model: 'module' })
        .expect(201);

      expect(res.body.data).toBeDefined();
    });

    it('should call deleteByPattern on cache', async () => {
      jest.spyOn(testApp.cacheAdapter, 'deleteByPattern');

      await request(app.getHttpServer())
        .post(`${API}/strapi/webhook/cache-invalidation`)
        .set('x-webhook-secret', WEBHOOK_SECRET)
        .send({ event: 'entry.update' })
        .expect(201);

      expect(testApp.cacheAdapter.deleteByPattern).toHaveBeenCalledWith(
        'strapi:*',
      );
    });

    it('should return 401 without secret header', async () => {
      await request(app.getHttpServer())
        .post(`${API}/strapi/webhook/cache-invalidation`)
        .send({ event: 'entry.update' })
        .expect(401);
    });

    it('should return 401 with wrong secret', async () => {
      await request(app.getHttpServer())
        .post(`${API}/strapi/webhook/cache-invalidation`)
        .set('x-webhook-secret', 'wrong-secret')
        .send({ event: 'entry.update' })
        .expect(401);
    });
  });

  describe('GET /strapi/webhook/cache-timestamp', () => {
    it('should return null when no cache invalidation has occurred', async () => {
      const { accessToken } = await registerUser(app);

      const res = await request(app.getHttpServer())
        .get(`${API}/strapi/webhook/cache-timestamp`)
        .set(authHeader(accessToken))
        .expect(200);

      expect(res.body.data).toHaveProperty('timestamp', null);
    });

    it('should return timestamp after cache invalidation', async () => {
      const { accessToken } = await registerUser(app);

      // Invalidate cache first
      await request(app.getHttpServer())
        .post(`${API}/strapi/webhook/cache-invalidation`)
        .set('x-webhook-secret', WEBHOOK_SECRET)
        .send({})
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`${API}/strapi/webhook/cache-timestamp`)
        .set(authHeader(accessToken))
        .expect(200);

      expect(res.body.data.timestamp).toBeDefined();
      expect(res.body.data.timestamp).not.toBeNull();
    });

    it('should require JWT authentication', async () => {
      await request(app.getHttpServer())
        .get(`${API}/strapi/webhook/cache-timestamp`)
        .expect(401);
    });
  });
});
