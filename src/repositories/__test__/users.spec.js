import { prisma } from '../../lib/prisma.js';
import { UsersRepository } from '../users.js';

jest.mock('../../lib/prisma.js', () => ({
  prisma: {
    users: {
      findMany: jest.fn(),
    },
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
      // Mock the findMany method to return mock users
      prisma.users.findMany.mockResolvedValueOnce(mockUsers);

      // Call the function
      const result = await UsersRepository.getUsers(pagination);

      // Assertions
      expect(prisma.users.findMany).toHaveBeenCalledWith({
        skip: pagination.offset,
        take: pagination.limit,
        include: { Profiles: true },
      });
      expect(result).toEqual(mockUsers);
    });
  });
});
