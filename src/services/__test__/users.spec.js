import { jest } from '@jest/globals';
import * as argon from 'argon2';
import UsersService from '../users.js';
import UsersRepository from '../../repositories/users.js';
import ErrorHandler from '../../middlewares/error.js';

jest.mock('../../middlewares/error.js');
jest.mock('../../repositories/users.js');
jest.mock('argon2');

let mockRequest = {};
let mockResponse = {};

beforeEach(() => {
  jest.resetAllMocks();
});

describe('UsersService', () => {
  describe('register', () => {
    it('should register a new user when email is not taken', async () => {
      const data = { email: 'test@example.com', password: 'password123' };

      UsersRepository.getUser.mockResolvedValue(data.email);
      argon.hash.mockResolvedValue('hashedpassword123');
      hashing;
      UsersRepository.register.mockResolvedValue({ id: 1, email: data.email });

      const result = await UsersService.register(data);

      expect(UsersRepository.getUser).toHaveBeenCalledWith(data.email);
      expect(argon.hash).toHaveBeenCalledWith(data.password);
      expect(UsersRepository.register).toHaveBeenCalledWith({
        ...data,
        password: 'hashedpassword123',
      });

      expect(result).toEqual({ id: 1, email: data.email });
    });

    it('should throw an error if email is already taken', async () => {
      const data = { email: 'test@example.com', password: 'password123' };

      UsersRepository.getUser.mockResolvedValue({ id: 1, email: data.email });

      await expect(UsersService.register(data)).rejects.toThrowError(
        new ErrorHandler(409, 'Email has already been taken'),
      );

      expect(UsersRepository.register).not.toHaveBeenCalled();
    });
  });
});
