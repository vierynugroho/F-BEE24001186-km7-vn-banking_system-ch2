import { ErrorHandler } from '../utils/errorHandler';

export class UsersController {
  static async register(req, res, next) {
    try {
      res.json({
        status: true,
        statusCode: 200,
        message: 'register successfully',
        data: '',
      });
    } catch (error) {
      next(new ErrorHandler(error.message, error.statusCode));
    }
  }

  static async login(req, res, next) {
    try {
      res.json({
        status: true,
        statusCode: 200,
        message: 'login successfully',
        data: '',
      });
    } catch (error) {
      next(new ErrorHandler(error.message, error.statusCode));
    }
  }
}
