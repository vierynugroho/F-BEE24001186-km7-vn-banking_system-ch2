import { ErrorHandler } from '../middlewares/error.js';
import { UsersService } from '../services/users.js';

export class UsersController {
  static async register(req, res, next) {
    try {
      const data = req.body;

      const userRegister = await UsersService.register(data);

      delete userRegister.user.password;

      res.json({
        status: true,
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
        status: true,
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
      const users = await UsersService.getUsers();

      users.map((user) => {
        delete user.password;
      });

      res.json({
        status: true,
        statusCode: 200,
        message: 'users data retrieved successfully',
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
        status: true,
        statusCode: 200,
        message: 'user data retrieved successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}
