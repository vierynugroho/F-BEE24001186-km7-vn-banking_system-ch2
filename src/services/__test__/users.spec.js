import * as argon from 'argon2';
import { UsersService } from '../../services/users.js';
import { UsersRepository } from '../../repositories/users.js';
import { ErrorHandler } from '../../middlewares/error.js';
import generateJWT from '../../utils/jwtGenerate.js';

jest.mock('argon2');
jest.mock('../../repositories/users.js');
jest.mock('../../utils/jwtGenerate.js');

describe('User Services', () => {
  let mockUser;

  afterAll(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    mockUser = {
      name: 'viery nugroho',
      email: 'vierynugroho@gmail.com',
      password: 'password',
      identity_type: 'KTP',
      identity_number: '6289516424305',
      address: 'Blitar',
    };

    const hashPasswordSpy = jest
      .spyOn(argon, 'hash')
      .mockResolvedValueOnce(mockUser.password);

    mockUser.password = hashPasswordSpy;
  });

  describe('register', () => {
    test('should throw an error if email is already taken', async () => {
      UsersRepository.getUser.mockResolvedValueOnce(mockUser.email);

      await expect(UsersService.register(mockUser)).rejects.toThrow(
        ErrorHandler,
      );
    });

    test('should register a new user successfully', async () => {
      UsersRepository.getUser.mockResolvedValueOnce(null);
      jest.spyOn(argon, 'hash').mockResolvedValueOnce(mockUser.password);
      UsersRepository.register.mockResolvedValueOnce({
        email: mockUser.email,
      });

      const hashedPassword = await argon.hash(mockUser.password);
      mockUser.password = hashedPassword;

      const result = await UsersService.register(mockUser);

      expect(result).toEqual({
        email: mockUser.email,
      });
      expect(UsersRepository.getUser).toHaveBeenCalledWith(mockUser.email);
      expect(UsersRepository.register).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('login', () => {
    test('should throw an error if user does not exist', async () => {
      UsersRepository.getUser.mockResolvedValueOnce(null);

      await expect(
        UsersService.login({
          email: 'nonexistent@example.com',
          password: mockUser.password,
        }),
      ).rejects.toThrow(ErrorHandler);
    });

    test('should throw an error if password is incorrect', async () => {
      UsersRepository.getUser.mockResolvedValueOnce(mockUser);

      argon.verify.mockResolvedValueOnce(false);

      await expect(
        UsersService.login({
          email: mockUser.email,
          password: 'wrongPassword',
        }),
      ).rejects.toThrow(ErrorHandler);

      expect(argon.verify).toHaveBeenCalledWith(
        mockUser.password,
        'wrongPassword',
      );
    });

    test('should login successfully with correct credentials', async () => {
      UsersRepository.getUser.mockResolvedValueOnce(mockUser);

      argon.verify.mockResolvedValueOnce(false);

      await expect(
        UsersService.login({
          email: mockUser.email,
          password: mockUser.password,
        }),
      ).rejects.toThrow(ErrorHandler);

      expect(argon.verify).toHaveBeenCalledWith(
        mockUser.password,
        mockUser.password,
      );
    });

    test('should login successfully with returning user data', async () => {
      mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'hashed_password', // Ini adalah password yang sudah di-hash
        Profiles: {
          address: '123 Main St',
          identity_number: '1234567890',
          identity_type: 'ID Card',
        },
      };

      const loginData = {
        email: 'john.doe@example.com',
        password: 'plain_password',
      };

      UsersRepository.getUser.mockResolvedValue(mockUser);
      argon.verify.mockResolvedValue(true);

      const mockToken = 'mock_jwt_token';
      generateJWT.mockReturnValue(mockToken);

      const result = await UsersService.login(loginData);

      expect(result).toEqual({
        user: mockUser,
        token: mockToken,
      });
    });
  });

  describe('getUsers', () => {
    test('should return users and total count', async () => {
      const mockUsers = [{ id: 1, email: 'test@example.com' }];
      UsersRepository.getUsers.mockResolvedValueOnce(mockUsers);
      UsersRepository.countUsers.mockResolvedValueOnce(1);

      const result = await UsersService.getUsers({ page: 1, limit: 10 });

      expect(result).toEqual({ users: mockUsers, totalUser: 1 });
    });
  });

  describe('getUser', () => {
    test('should return user by email', async () => {
      const mockUser = { email: 'test@example.com' };
      UsersRepository.getUser.mockResolvedValueOnce(mockUser);

      const result = await UsersService.getUser('test@example.com');

      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserById', () => {
    test('should return user by ID', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      UsersRepository.getUserById.mockResolvedValueOnce(mockUser);

      const result = await UsersService.getUserById(1);

      expect(result).toEqual(mockUser);
    });
  });
});
