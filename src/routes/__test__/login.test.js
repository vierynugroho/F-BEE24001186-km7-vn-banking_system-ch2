import request from 'supertest';
import app from '../../app.js';
import { prisma } from '../../lib/prisma.js';
import * as argon from 'argon2';

jest.useRealTimers();
jest.mock('../../lib/prisma.js', () => ({
  prisma: {
    users: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    profiles: {
      create: jest.fn(),
    },
  },
}));

describe('Auth - Login', () => {
  let server;
  let hashedPassword;

  const userData = {
    email: 'vierynugroho@gmail.com',
    password: 'password',
  };

  beforeAll(async () => {
    server = app.listen();
    hashedPassword = await argon.hash(userData.password);
  });

  afterAll(async () => {
    await server.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should log in successfully with valid credentials', async () => {
    prisma.users.findUnique.mockResolvedValue({
      id: 1,
      name: 'viery nugroho',
      email: userData.email,
      password: hashedPassword,
      Profiles: [
        {
          id: 1,
          identity_type: 'KTP',
          identity_number: '6289516424305',
          address: 'Blitar',
          user_id: 1,
        },
      ],
    });

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send(userData)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('meta');
    expect(response.body.meta).toHaveProperty('statusCode', 200);
    expect(response.body.meta).toHaveProperty('message', 'login successfully');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('_token', expect.any(String)); // Expect a JWT token
  });

  test('should return a 401 error with invalid credentials', async () => {
    prisma.users.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: userData.email, password: 'wrongpassword' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('statusCode', 401);
    expect(response.body.error).toHaveProperty('message', 'wrong credential');
  });

  test('should return a 422 error when fields are missing', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: '' }) // Missing password
      .set('Accept', 'application/json');

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('statusCode', 422);
  });

  test('should return not found for an incorrect route', async () => {
    const response = await request(app).get('/api/v1/auth/signIn');
    expect(response.statusCode).toBe(404);
  });
});
