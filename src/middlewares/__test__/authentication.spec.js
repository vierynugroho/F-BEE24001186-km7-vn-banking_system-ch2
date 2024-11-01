import jwt from 'jsonwebtoken';
import authMiddleware from '../authentication.js';
import { ErrorHandler } from '../error.js';
import { prisma } from '../../libs/prisma.js';

jest.mock('jsonwebtoken');
jest.mock('../../libs/prisma.js', () => ({
  prisma: {
    users: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {};
    next = jest.fn();
  });

  it('should return 401 if no authorization token is provided', async () => {
    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      new ErrorHandler(401, 'unauthorized, token is not found'),
    );
  });

  it('should return 401 if the token is invalid', async () => {
    req.headers.authorization = 'Bearer invalidToken';
    jwt.verify.mockImplementation(() => {
      throw new ErrorHandler(401, 'unauthorized, token is invalid');
    });

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ErrorHandler));
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('should set req.user and call next if token and user are valid', async () => {
    req.headers.authorization = 'Bearer validToken';
    const mockUser = { id: 1, name: 'Test User', password: 'hashedpassword' };
    jwt.verify.mockReturnValue({ id: 1 });
    prisma.users.findUnique.mockResolvedValue(mockUser);

    await authMiddleware(req, res, next);

    expect(req.user).toEqual({ id: 1, name: 'Test User' });
    expect(next).toHaveBeenCalledWith();
  });
});
