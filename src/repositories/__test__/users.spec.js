import { prisma } from '../../libs/prisma.js';
import { AuthRepository } from '../auth.js';
import { UsersRepository } from '../users.js';

jest.mock('../../libs/prisma.js', () => ({
  prisma: {
    users: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    profiles: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

describe('Users Repository', () => {
  const mockUsers = [
    {
      id: 1,
      name: 'User 2',
      email: 'user2@example.com',
      Profiles: {
        id: 1,
        identity_type: 'KTP',
        identity_number: '100000001',
        address: 'Address 2',
        user_id: 1,
      },
    },
    {
      id: 2,
      name: 'User 6',
      email: 'user6@example.com',
      Profiles: {
        id: 2,
        identity_type: 'GIRO',
        identity_number: '100000005',
        address: 'Address 6',
        user_id: 2,
      },
    },
  ];

  const pagination = { limit: 10, offset: 0 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get users', () => {
    test('should return a list of users with profiles based on pagination', async () => {
      prisma.users.findMany.mockResolvedValueOnce(mockUsers);

      const result = await UsersRepository.getUsers(pagination);

      expect(prisma.users.findMany).toHaveBeenCalledWith({
        skip: pagination.offset,
        take: pagination.limit,
        include: { Profiles: true },
      });
      expect(result).toEqual(mockUsers);
    });
  });

  describe('count users', () => {
    test('should return the total number of users', async () => {
      const mockUserCount = 5;
      prisma.users.count.mockResolvedValueOnce(mockUserCount);

      const result = await UsersRepository.countUsers();

      expect(prisma.users.count).toHaveBeenCalled();
      expect(result).toBe(mockUserCount);
    });
  });

  describe('get user by email', () => {
    test('should return a user with their profile information based on email', async () => {
      const email = 'user@example.com';
      prisma.users.findUnique.mockResolvedValueOnce(mockUsers[0]);

      const result = await UsersRepository.getUser(email);

      expect(prisma.users.findUnique).toHaveBeenCalledWith({
        where: { email },
        include: { Profiles: true },
      });
      expect(result).toEqual(mockUsers[0]);
    });

    test('should return null if user with given email does not exist', async () => {
      prisma.users.findUnique.mockResolvedValueOnce(null);

      const result = await UsersRepository.getUser('nonexistent@example.com');

      expect(prisma.users.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
        include: { Profiles: true },
      });
      expect(result).toBeNull();
    });
  });

  describe('get user by ID', () => {
    test('should return a user with their profile information based on userID', async () => {
      const userID = 1;
      prisma.users.findUnique.mockResolvedValueOnce(mockUsers[0]);

      const result = await UsersRepository.getUserById(userID);

      expect(prisma.users.findUnique).toHaveBeenCalledWith({
        where: { id: userID },
        include: { Profiles: true },
      });
      expect(result).toEqual(mockUsers[0]);
    });

    test('should return null if user with given userID does not exist', async () => {
      prisma.users.findUnique.mockResolvedValueOnce(null);
      const nonExistentUserID = 999;

      const result = await UsersRepository.getUserById(nonExistentUserID);

      expect(prisma.users.findUnique).toHaveBeenCalledWith({
        where: { id: nonExistentUserID },
        include: { Profiles: true },
      });
      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    test('should create a user and profile and return the created data', async () => {
      const userData = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password',
        identity_type: 'KTP',
        identity_number: '123456789',
        address: 'INDONESIA',
      };

      const mockUser = {
        id: 1,
        name: userData.name,
        email: userData.email,
        password: userData.password,
      };

      const mockProfile = {
        id: 1,
        user_id: mockUser.id,
        identity_type: userData.identity_type,
        identity_number: userData.identity_number,
        address: userData.address,
      };

      prisma.$transaction.mockImplementationOnce(async (callback) => {
        return callback({
          users: { create: jest.fn().mockResolvedValue(mockUser) },
          profiles: { create: jest.fn().mockResolvedValue(mockProfile) },
        });
      });

      const result = await AuthRepository.register(userData);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual({ user: mockUser, profile: mockProfile });
    });
  });
});
