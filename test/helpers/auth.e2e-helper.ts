import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

const API = '/api/v1';

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export async function registerUser(
  app: INestApplication,
  data?: Partial<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }>,
): Promise<AuthResult> {
  const body = {
    email: data?.email ?? 'testuser@example.com',
    password: data?.password ?? 'ValidPass123!',
    firstName: data?.firstName ?? 'Test',
    lastName: data?.lastName ?? 'User',
    ...data,
  };

  const res = await request(app.getHttpServer())
    .post(`${API}/auth/register`)
    .send(body)
    .expect(201);

  return {
    accessToken: res.body.data.accessToken,
    refreshToken: res.body.data.refreshToken,
    userId: res.body.data.userId,
  };
}

export async function loginUser(
  app: INestApplication,
  email: string,
  password: string,
): Promise<AuthResult> {
  const res = await request(app.getHttpServer())
    .post(`${API}/auth/login`)
    .send({ email, password })
    .expect(200);

  return {
    accessToken: res.body.data.accessToken,
    refreshToken: res.body.data.refreshToken,
    userId: res.body.data.userId,
  };
}

export function authHeader(accessToken: string): Record<string, string> {
  return { Authorization: `Bearer ${accessToken}` };
}

export async function createAdminUser(
  app: INestApplication,
): Promise<AuthResult> {
  // Register first user
  await registerUser(app, {
    email: 'first-admin@example.com',
    password: 'AdminPass123!',
    firstName: 'First',
    lastName: 'Admin',
  });

  // Register the admin user
  const admin = await registerUser(app, {
    email: 'admin@example.com',
    password: 'AdminPass123!',
    firstName: 'Admin',
    lastName: 'User',
  });

  // Promote admin using first user (but first user isn't admin yet)
  // We need to directly set the role via the repository since we can't bootstrap
  // Instead, we'll use the test app's userRepository directly
  // This helper should be used with the E2eTestApp's userRepository
  return admin;
}
