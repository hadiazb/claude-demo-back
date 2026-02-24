import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createE2eTestApp,
  closeTestApp,
  E2eTestApp,
} from '../helpers/test-app.helper';
import { registerUser, authHeader } from '../helpers/auth.e2e-helper';

const API = '/api/v1';

describe('Auth (e2e)', () => {
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

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app.getHttpServer())
        .post(`${API}/auth/register`)
        .send({
          email: 'new@example.com',
          password: 'ValidPass123!',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(201);

      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data).toHaveProperty('userId');
    });

    it('should send welcome email after registration', async () => {
      await request(app.getHttpServer())
        .post(`${API}/auth/register`)
        .send({
          email: 'welcome@example.com',
          password: 'ValidPass123!',
          firstName: 'Welcome',
          lastName: 'User',
        })
        .expect(201);

      // Welcome email is sent asynchronously, give it a tick
      await new Promise((r) => setTimeout(r, 50));
      expect(testApp.mockEmail.sendWelcomeEmail).toHaveBeenCalledWith(
        'welcome@example.com',
        'Welcome',
      );
    });

    it('should return 409 when email is already registered', async () => {
      await registerUser(app, { email: 'dup@example.com' });

      await request(app.getHttpServer())
        .post(`${API}/auth/register`)
        .send({
          email: 'dup@example.com',
          password: 'ValidPass123!',
          firstName: 'Dup',
          lastName: 'User',
        })
        .expect(409);
    });

    it('should return 400 when required fields are missing', async () => {
      await request(app.getHttpServer())
        .post(`${API}/auth/register`)
        .send({ email: 'test@example.com' })
        .expect(400);
    });

    it('should return 400 for invalid email', async () => {
      await request(app.getHttpServer())
        .post(`${API}/auth/register`)
        .send({
          email: 'invalid-email',
          password: 'ValidPass123!',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(400);
    });

    it('should return 400 for weak password (no uppercase)', async () => {
      await request(app.getHttpServer())
        .post(`${API}/auth/register`)
        .send({
          email: 'test@example.com',
          password: 'weakpass123!',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(400);
    });

    it('should return 400 for short password', async () => {
      await request(app.getHttpServer())
        .post(`${API}/auth/register`)
        .send({
          email: 'test@example.com',
          password: 'Sh1!',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(400);
    });

    it('should return 400 for short firstName', async () => {
      await request(app.getHttpServer())
        .post(`${API}/auth/register`)
        .send({
          email: 'test@example.com',
          password: 'ValidPass123!',
          firstName: 'J',
          lastName: 'Doe',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await registerUser(app, {
        email: 'login@example.com',
        password: 'ValidPass123!',
      });
    });

    it('should login successfully with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post(`${API}/auth/login`)
        .send({ email: 'login@example.com', password: 'ValidPass123!' })
        .expect(200);

      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('should return 401 for non-existent email', async () => {
      await request(app.getHttpServer())
        .post(`${API}/auth/login`)
        .send({ email: 'nope@example.com', password: 'ValidPass123!' })
        .expect(401);
    });

    it('should return 401 for wrong password', async () => {
      await request(app.getHttpServer())
        .post(`${API}/auth/login`)
        .send({ email: 'login@example.com', password: 'WrongPass123!' })
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh tokens successfully', async () => {
      const { refreshToken } = await registerUser(app);

      const res = await request(app.getHttpServer())
        .post(`${API}/auth/refresh`)
        .send({ refreshToken })
        .expect(200);

      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      // Verify the old refresh token is revoked (can't be used again)
      await request(app.getHttpServer())
        .post(`${API}/auth/refresh`)
        .send({ refreshToken })
        .expect(401);
    });

    it('should revoke old token after refresh', async () => {
      const { refreshToken } = await registerUser(app);

      // First refresh should work
      await request(app.getHttpServer())
        .post(`${API}/auth/refresh`)
        .send({ refreshToken })
        .expect(200);

      // Second refresh with same token should fail (already revoked)
      await request(app.getHttpServer())
        .post(`${API}/auth/refresh`)
        .send({ refreshToken })
        .expect(401);
    });

    it('should return 401 for invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post(`${API}/auth/refresh`)
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const { accessToken, refreshToken } = await registerUser(app);

      await request(app.getHttpServer())
        .post(`${API}/auth/logout`)
        .set(authHeader(accessToken))
        .send({ refreshToken })
        .expect(200);
    });

    it('should return 401 without JWT', async () => {
      await request(app.getHttpServer())
        .post(`${API}/auth/logout`)
        .send({ refreshToken: 'some-token' })
        .expect(401);
    });
  });

  describe('POST /auth/logout-all', () => {
    it('should revoke all tokens', async () => {
      const { accessToken, refreshToken } = await registerUser(app);

      await request(app.getHttpServer())
        .post(`${API}/auth/logout-all`)
        .set(authHeader(accessToken))
        .expect(200);

      // Original refresh token should no longer work
      await request(app.getHttpServer())
        .post(`${API}/auth/refresh`)
        .send({ refreshToken })
        .expect(401);
    });

    it('should return 401 without JWT', async () => {
      await request(app.getHttpServer())
        .post(`${API}/auth/logout-all`)
        .expect(401);
    });
  });

  describe('Full auth flow', () => {
    it('should handle register → login → refresh → logout', async () => {
      // Register
      const registerRes = await request(app.getHttpServer())
        .post(`${API}/auth/register`)
        .send({
          email: 'flow@example.com',
          password: 'FlowPass123!',
          firstName: 'Flow',
          lastName: 'Test',
        })
        .expect(201);

      const { userId } = registerRes.body.data;
      expect(userId).toBeDefined();

      // Login
      const loginRes = await request(app.getHttpServer())
        .post(`${API}/auth/login`)
        .send({ email: 'flow@example.com', password: 'FlowPass123!' })
        .expect(200);

      const { refreshToken } = loginRes.body.data;

      // Refresh
      const refreshRes = await request(app.getHttpServer())
        .post(`${API}/auth/refresh`)
        .send({ refreshToken })
        .expect(200);

      const newAccessToken = refreshRes.body.data.accessToken;
      const newRefreshToken = refreshRes.body.data.refreshToken;

      // Logout with new tokens
      await request(app.getHttpServer())
        .post(`${API}/auth/logout`)
        .set(authHeader(newAccessToken))
        .send({ refreshToken: newRefreshToken })
        .expect(200);
    });
  });
});
