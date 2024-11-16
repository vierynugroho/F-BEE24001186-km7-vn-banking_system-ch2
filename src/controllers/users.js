import { ErrorHandler } from '../middlewares/error.js';
import { AccountsService } from '../services/accounts.js';
import { UsersService } from '../services/users.js';

export class UsersController {
  static async getUserLoggedIn(req, res, next) {
    try {
      const userLoggedIn = req.user;
      const accounts = await AccountsService.getAccountByUserID(
        userLoggedIn.id,
      );

      const userLoggedInData = {
        ...userLoggedIn,
        accounts,
      };

      await Notification.push('user logged in data retrieved successfully!');

      res.json({
        meta: {
          statusCode: 200,
          message: 'user logged in data retrieved successfully',
        },
        data: userLoggedInData,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;

      const offset = (page - 1) * limit;
      const pagination = {
        offset,
        limit,
      };

      const { users, totalUser } = await UsersService.getUsers(pagination);

      users.map((user) => {
        delete user.password;
      });

      await Notification.push('users data retrieved successfully!');

      res.json({
        meta: {
          statusCode: 200,
          message: 'users data retrieved successfully',
          pagination: {
            totalPage: Math.ceil(totalUser / limit),
            currentPage: page,
            pageItems: users.length,
            nextPage: page < Math.ceil(totalUser / limit) ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
          },
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
      const userLoggedIn = req.user;

      if (isNaN(userID)) {
        throw new ErrorHandler(400, 'userID must be a number');
      }

      if (userLoggedIn.role != 'ADMIN' && userLoggedIn.id !== userID) {
        throw new ErrorHandler(403, `you doesn't have an access for this data`);
      }

      const user = await UsersService.getUserById(userID);

      if (!user) {
        throw new ErrorHandler(404, `user with id ${userID} is not found`);
      }

      delete user.password;

      await Notification.push('user data retrieved successfully!');

      res.json({
        meta: {
          statusCode: 200,
          message: 'user data retrieved successfully',
        },
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const userID = parseInt(req.user.id);
      console.log(req.user);
      const files = req.files;
      const data = req.body;

      if (isNaN(userID)) {
        throw new ErrorHandler(400, 'userID must be a number');
      }

      const updateProfile = await UsersService.upsertUserData(
        data,
        files,
        userID,
      );

      await Notification.push('user data updated successfully!');

      res.json({
        meta: {
          statusCode: 200,
          message: 'user data updated successfully',
        },
        data: updateProfile,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProfileData(req, res, next) {
    try {
      const userID = parseInt(req.user.id);

      if (isNaN(userID)) {
        throw new ErrorHandler(400, 'userID must be a number');
      }

      const updateProfile = await UsersService.deleteUserData(userID);

      await Notification.push('user data deleted successfully!');

      res.json({
        meta: {
          statusCode: 200,
          message: 'user data updated successfully',
        },
        data: updateProfile,
      });
    } catch (error) {
      next(error);
    }
  }
}
