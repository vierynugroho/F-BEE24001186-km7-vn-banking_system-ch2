import { ErrorHandler } from '../../middlewares/error.js';
import { AccountsService } from '../../services/accounts.js';
import { UsersService } from '../../services/users.js';
import { UsersController } from '../users.js';

jest.mock('../../services/users.js');

describe('Users Controller', () => {
  let res, req, next;

  req = {
    body: {},
    user: {},
    query: {},
    params: {},
  };
  res = {
    json: jest.fn(),
  };
  next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a user successfully and return response data without the password', async () => {
      const userRegister = {
        user: {
          username: 'testuser',
          email: 'testuser@example.com',
        },
      };

      jest.spyOn(UsersService, 'register').mockResolvedValue(userRegister);

      await UsersController.register(req, res, next);

      expect(UsersService.register).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith({
        meta: {
          statusCode: 200,
          message: 'register successfully',
        },
        data: userRegister,
      });
    });

    it('should handle errors thrown by the service', async () => {
      req.body = { username: 'testuser', password: 'secret' };
      UsersService.register.mockRejectedValue(
        new ErrorHandler('Registration error'),
      );

      await UsersController.register(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ErrorHandler));
    });
  });

  describe('login', () => {
    req.body.email = 'testuser@example.com';
    req.body.password = 'testpassword';

    it('should log in a user successfully and return a token without the password', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'testuser@example.com',
      };
      const token = 'mocked-jwt-token';

      jest.spyOn(UsersService, 'login').mockResolvedValue({ user, token });

      await UsersController.login(req, res, next);

      expect(UsersService.login).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith({
        meta: {
          statusCode: 200,
          message: 'login successfully',
        },
        data: {
          _token: token,
        },
      });
    });

    it('should call next with an error if login fails', async () => {
      const error = new Error('Login failed');

      jest.spyOn(UsersService, 'login').mockRejectedValue(error);

      await UsersController.login(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('get logged in information', () => {
    req.user = {
      id: 1,
      username: 'testuser',
      email: 'testuser@example.com',
    };

    it('should retrieve logged in user data successfully with associated accounts', async () => {
      const accounts = [
        { id: 101, type: 'savings', balance: 5000 },
        { id: 102, type: 'checking', balance: 1500 },
      ];

      jest
        .spyOn(AccountsService, 'getAccountByUserID')
        .mockResolvedValue(accounts);

      await UsersController.getUserLoggedIn(req, res, next);

      expect(AccountsService.getAccountByUserID).toHaveBeenCalledWith(
        req.user.id,
      );
      expect(res.json).toHaveBeenCalledWith({
        meta: {
          statusCode: 200,
          message: 'user logged in data retrieved successfully',
        },
        data: {
          ...req.user,
          accounts,
        },
      });
    });

    it('should call next with an error if retrieving user data fails', async () => {
      const error = new ErrorHandler(401, 'Failed to retrieve accounts');

      jest
        .spyOn(AccountsService, 'getAccountByUserID')
        .mockRejectedValue(error);

      await UsersController.getUserLoggedIn(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('get all users data', () => {
    const mockUsersData = (totalUsers, limit) => {
      const users = Array.from({ length: limit }, (_, i) => ({
        id: i + 1,
        username: `user${i + 1}`,
        password: 'hashed_password',
      }));
      UsersService.getUsers.mockResolvedValue({
        users,
        totalUser: totalUsers,
      });
    };

    it('should parse page and limit as integers and default to 1 and 5 if not provided', async () => {
      mockUsersData(50, 5); // Mock a response with 50 users, and we expect 5 per page by default.

      await UsersController.getUsers(req, res, next);

      expect(parseInt(req.query.page)).toBeNaN();
      expect(parseInt(req.query.limit)).toBeNaN();
      expect(res.json).toHaveBeenCalledWith({
        meta: {
          statusCode: 200,
          message: 'users data retrieved successfully',
          pagination: {
            totalPage: 10,
            currentPage: 1,
            pageItems: 5,
            nextPage: 2,
            prevPage: null,
          },
        },
        data: expect.any(Array),
      });
    });

    it('should correctly parse and use valid page and limit values', async () => {
      req.query.page = '2';
      req.query.limit = '10';
      mockUsersData(50, 10);

      await UsersController.getUsers(req, res, next);

      expect(parseInt(req.query.page)).toBe(2);
      expect(parseInt(req.query.limit)).toBe(10);
      expect(res.json).toHaveBeenCalledWith({
        meta: {
          statusCode: 200,
          message: 'users data retrieved successfully',
          pagination: {
            totalPage: 5,
            currentPage: 2,
            pageItems: 10,
            nextPage: 3,
            prevPage: 1,
          },
        },
        data: expect.any(Array),
      });
    });

    it('should handle invalid page and limit inputs gracefully and fallback to defaults', async () => {
      req.query.page = 'invalid';
      req.query.limit = 'invalid';
      mockUsersData(50, 5);

      await UsersController.getUsers(req, res, next);

      expect(parseInt(req.query.page)).toBeNaN();
      expect(parseInt(req.query.limit)).toBeNaN();
      expect(res.json).toHaveBeenCalledWith({
        meta: {
          statusCode: 200,
          message: 'users data retrieved successfully',
          pagination: {
            totalPage: 10,
            currentPage: 1,
            pageItems: 5,
            nextPage: 2,
            prevPage: null,
          },
        },
        data: expect.any(Array),
      });
    });

    it('should calculate nextPage and prevPage correctly', async () => {
      req.query.page = '3';
      req.query.limit = '10';
      mockUsersData(50, 10);

      await UsersController.getUsers(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        meta: {
          statusCode: 200,
          message: 'users data retrieved successfully',
          pagination: {
            totalPage: 5,
            currentPage: 3,
            pageItems: 10,
            nextPage: 4,
            prevPage: 2,
          },
        },
        data: expect.any(Array),
      });
    });

    it('should return nextPage as null on the last page', async () => {
      req.query.page = '5';
      req.query.limit = '10';
      mockUsersData(50, 10);

      await UsersController.getUsers(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        meta: {
          statusCode: 200,
          message: 'users data retrieved successfully',
          pagination: {
            totalPage: 5,
            currentPage: 5,
            pageItems: 10,
            nextPage: null,
            prevPage: 4,
          },
        },
        data: expect.any(Array),
      });
    });

    it('should return prevPage as null on the first page', async () => {
      req.query.page = '1';
      req.query.limit = '10';
      mockUsersData(50, 10);

      await UsersController.getUsers(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        meta: {
          statusCode: 200,
          message: 'users data retrieved successfully',
          pagination: {
            totalPage: 5,
            currentPage: 1,
            pageItems: 10,
            nextPage: 2,
            prevPage: null,
          },
        },
        data: expect.any(Array),
      });
    });

    it('should call next with an error if UsersService.getUsers throws an error', async () => {
      const mockError = new Error('Database connection error');
      UsersService.getUsers.mockRejectedValue(mockError); // Simulate service error

      await UsersController.getUsers(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('get user data by userID', () => {
    it('should return user data successfully for ADMIN role', async () => {
      const userID = 1;
      req.params.userId = userID;
      req.user = { role: 'ADMIN', id: 2 };
      const user = {
        id: userID,
        name: 'John Doe',
        password: 'hashedpassword',
      };

      UsersService.getUserById.mockResolvedValue(user);

      await UsersController.getUserById(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        meta: {
          statusCode: 200,
          message: 'user data retrieved successfully',
        },
        data: { id: userID, name: 'John Doe' }, // password should be deleted
      });
    });

    it('should return user data successfully for the logged-in user', async () => {
      const userID = 1;
      req.params.userId = userID;
      req.user = { role: 'USER', id: userID };
      const user = {
        id: userID,
        name: 'John Doe',
        password: 'hashedpassword',
      };

      UsersService.getUserById.mockResolvedValue(user);

      await UsersController.getUserById(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        meta: {
          statusCode: 200,
          message: 'user data retrieved successfully',
        },
        data: { id: userID, name: 'John Doe' }, // password should be deleted
      });
    });

    it('should throw 400 error if userID is not a number', async () => {
      req.params.userId = 'invalid';
      req.user = { role: 'ADMIN', id: 2 };

      await UsersController.getUserById(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new ErrorHandler(400, 'userID must be a number'),
      );
    });

    it('should throw 403 error if user does not have access', async () => {
      const userID = 1;
      req.params.userId = userID;
      req.user = { role: 'USER', id: 2 };

      await UsersController.getUserById(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new ErrorHandler(403, `you doesn't have an access for this data`),
      );
    });

    it('should throw 404 error if user is not found', async () => {
      const userID = 1;
      req.params.userId = userID;
      req.user = { role: 'ADMIN', id: 2 };

      UsersService.getUserById.mockResolvedValue(null);

      await UsersController.getUserById(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new ErrorHandler(404, `user with id ${userID} is not found`),
      );
    });
  });
});
