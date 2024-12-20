import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../libs/prisma.js';

jest.useRealTimers();

// Mock Prisma
jest.mock('../../libs/prisma.js', () => ({
  prisma: {
    users: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    profiles: {
      create: jest.fn(),
    },
    $transaction: jest.fn((operations) => Promise.all(operations)),
  },
}));

describe('Auth - Register', () => {
  let server;

  const registerData = {
    name: 'viery nugroho',
    email: 'vierynugroho@gmail.com',
    password: 'password',
    identity_type: 'KTP',
    identity_number: '6289516424305',
    address: 'Blitar',
  };

  const mockUser = {
    id: 13,
    name: registerData.name,
    email: registerData.email,
    password: 'hashedpassword',
    role: 'CUSTOMER',
  };

  const mockProfile = {
    id: 13,
    identity_type: registerData.identity_type,
    identity_number: registerData.identity_number,
    address: registerData.address,
    user_id: 13,
  };

  beforeAll(() => {
    server = app.listen();
  });

  afterAll(async () => {
    await server.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should register a new user successfully', async () => {
    prisma.users.findUnique.mockResolvedValue(null);
    prisma.users.create.mockResolvedValue(mockUser);
    prisma.profiles.create.mockResolvedValue(mockProfile);

    prisma.$transaction.mockImplementation(async (callback) => {
      return await callback(prisma);
    });

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(registerData)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
  });

  test('should return a 422 error for missing required fields', async () => {
    const invalidData = { ...registerData, email: '' };

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(invalidData)
      .set('Accept', 'application/json');

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('error');
  });

  test('should return a 409 error if user with email already exists', async () => {
    prisma.users.findUnique.mockResolvedValue(mockUser);

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(registerData)
      .set('Accept', 'application/json');

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty('error');
  });

  test('should return a 404 error for an incorrect route', async () => {
    const response = await request(app).get('/api/v1/auth/registerr');
    expect(response.statusCode).toBe(404);
  });
});
