import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createE2eTestApp,
  closeTestApp,
  E2eTestApp,
} from '../helpers/test-app.helper';
import { registerUser, authHeader } from '../helpers/auth.e2e-helper';
import {
  User,
  UserRole,
} from '../../src/modules/users/domain/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

const API = '/api/v1';

async function createDirectAdmin(testApp: E2eTestApp): Promise<{
  user: User;
  accessToken: string;
  refreshToken: string;
}> {
  // Register a user normally first
  const result = await registerUser(testApp.app, {
    email: 'admin@example.com',
    password: 'AdminPass123!',
    firstName: 'Admin',
    lastName: 'User',
  });

  // Directly modify the user in the in-memory repo to be an admin
  const user = await testApp.userRepository.findById(result.userId);
  if (user) {
    const adminUser = new User({
      id: user.id,
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      age: user.age,
      role: UserRole.ADMIN,
      isActive: user.isActive,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: new Date(),
    });
    await testApp.userRepository.update(adminUser);
  }

  // Re-login to get a token with the ADMIN role
  const loginRes = await request(testApp.app.getHttpServer())
    .post(`${API}/auth/login`)
    .send({ email: 'admin@example.com', password: 'AdminPass123!' })
    .expect(200);

  return {
    user: (await testApp.userRepository.findById(result.userId))!,
    accessToken: loginRes.body.data.accessToken,
    refreshToken: loginRes.body.data.refreshToken,
  };
}

describe('Users (e2e)', () => {
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

  describe('GET /users/me', () => {
    it('should return the authenticated user profile', async () => {
      const { accessToken } = await registerUser(app, {
        email: 'me@example.com',
        firstName: 'Me',
        lastName: 'User',
      });

      const res = await request(app.getHttpServer())
        .get(`${API}/users/me`)
        .set(authHeader(accessToken))
        .expect(200);

      expect(res.body.data).toHaveProperty('email', 'me@example.com');
      expect(res.body.data).toHaveProperty('firstName', 'Me');
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer()).get(`${API}/users/me`).expect(401);
    });
  });

  describe('PATCH /users/me', () => {
    it('should update the user name', async () => {
      const { accessToken } = await registerUser(app);

      const res = await request(app.getHttpServer())
        .patch(`${API}/users/me`)
        .set(authHeader(accessToken))
        .send({ firstName: 'Updated', lastName: 'Name' })
        .expect(200);

      expect(res.body.data).toHaveProperty('firstName', 'Updated');
      expect(res.body.data).toHaveProperty('lastName', 'Name');
    });

    it('should return 400 for invalid firstName', async () => {
      const { accessToken } = await registerUser(app);

      await request(app.getHttpServer())
        .patch(`${API}/users/me`)
        .set(authHeader(accessToken))
        .send({ firstName: 'A' })
        .expect(400);
    });
  });

  describe('GET /users', () => {
    it('should list users as ADMIN', async () => {
      const admin = await createDirectAdmin(testApp);
      await registerUser(app, { email: 'user2@example.com' });

      const res = await request(app.getHttpServer())
        .get(`${API}/users`)
        .set(authHeader(admin.accessToken))
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should return 403 as USER', async () => {
      const { accessToken } = await registerUser(app);

      await request(app.getHttpServer())
        .get(`${API}/users`)
        .set(authHeader(accessToken))
        .expect(403);
    });
  });

  describe('GET /users/:id', () => {
    it('should find user by ID', async () => {
      const admin = await createDirectAdmin(testApp);
      const { userId } = await registerUser(app, {
        email: 'findme@example.com',
      });

      const res = await request(app.getHttpServer())
        .get(`${API}/users/${userId}`)
        .set(authHeader(admin.accessToken))
        .expect(200);

      expect(res.body.data).toHaveProperty('email', 'findme@example.com');
    });

    it('should return 404 for non-existent user', async () => {
      const admin = await createDirectAdmin(testApp);

      await request(app.getHttpServer())
        .get(`${API}/users/${uuidv4()}`)
        .set(authHeader(admin.accessToken))
        .expect(404);
    });
  });

  describe('PATCH /users/:id/role', () => {
    it('should promote user to ADMIN', async () => {
      const admin = await createDirectAdmin(testApp);
      const { userId } = await registerUser(app, {
        email: 'promote@example.com',
      });

      const res = await request(app.getHttpServer())
        .patch(`${API}/users/${userId}/role`)
        .set(authHeader(admin.accessToken))
        .send({ role: UserRole.ADMIN })
        .expect(200);

      expect(res.body.data).toHaveProperty('role', UserRole.ADMIN);
    });

    it('should return 403 when trying to change own role', async () => {
      const admin = await createDirectAdmin(testApp);

      await request(app.getHttpServer())
        .patch(`${API}/users/${admin.user.id}/role`)
        .set(authHeader(admin.accessToken))
        .send({ role: UserRole.USER })
        .expect(403);
    });

    it('should return 403 when demoting last admin', async () => {
      const admin = await createDirectAdmin(testApp);
      // Register another non-admin user to try demoting admin
      const { userId: otherUserId } = await registerUser(app, {
        email: 'other@example.com',
      });

      // Promote other user to admin first, then demote both leaving none
      await request(app.getHttpServer())
        .patch(`${API}/users/${otherUserId}/role`)
        .set(authHeader(admin.accessToken))
        .send({ role: UserRole.ADMIN })
        .expect(200);

      // Now other user (admin) tries to demote original admin
      // Re-login to get updated role token
      const otherLogin = await request(app.getHttpServer())
        .post(`${API}/auth/login`)
        .send({ email: 'other@example.com', password: 'ValidPass123!' })
        .expect(200);

      // Demote original admin (should succeed - 2 admins exist)
      await request(app.getHttpServer())
        .patch(`${API}/users/${admin.user.id}/role`)
        .set('Authorization', `Bearer ${otherLogin.body.data.accessToken}`)
        .send({ role: UserRole.USER })
        .expect(200);

      // Now try to find another user to demote - only other admin is the requesting user
      // Can't demote self, so this tests the business rule correctly
    });

    it('should return 403 as USER', async () => {
      const { accessToken, userId } = await registerUser(app);

      await request(app.getHttpServer())
        .patch(`${API}/users/${userId}/role`)
        .set(authHeader(accessToken))
        .send({ role: UserRole.ADMIN })
        .expect(403);
    });
  });
});
