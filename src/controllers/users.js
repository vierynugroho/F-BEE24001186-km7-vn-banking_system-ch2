import { ErrorHandler } from '../middlewares/error.js';
import { UsersService } from '../services/users.js';

export class UsersController {
  static async register(req, res, next) {
    try {
      const data = req.body;

      const userRegister = await UsersService.register(data);

      delete userRegister.user.password;

      res.json({
        statusCode: 200,
        message: 'register successfully',
        data: userRegister,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const data = req.body;

      const user = await UsersService.login(data);

      delete user.password;

      res.json({
        statusCode: 200,
        message: 'login successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;

      if (isNaN(page) || isNaN(limit)) {
        throw new ErrorHandler(400, 'page & limit must be a number');
      }

      const offset = (page - 1) * limit;
      const pagination = {
        offset,
        limit,
      };

      const { users, totalUser } = await UsersService.getUsers(pagination);

      users.map((user) => {
        delete user.password;
      });

      res.json({
        statusCode: 200,
        message: 'users data retrieved successfully',
        pagination: {
          totalPage: Math.ceil(totalUser / limit),
          currentPage: page,
          pageItems: users.length,
          nextPage: page < Math.ceil(totalUser / limit) ? page + 1 : null,
          prevPage: page > 1 ? page - 1 : null,
        },
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const userID = parseFloat(req.params.userId);

      if (isNaN(userID)) {
        throw new ErrorHandler(400, 'userID must be a number');
      }

      const user = await UsersService.getUserById(userID);

      if (!user) {
        throw new ErrorHandler(404, `user with id ${userID} is not found`);
      }

      delete user.password;

      res.json({
        statusCode: 200,
        message: 'user data retrieved successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}
