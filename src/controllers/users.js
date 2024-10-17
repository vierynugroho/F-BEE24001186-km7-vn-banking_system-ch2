import { ErrorHandler } from '../utils/errorHandler';

export class UsersController {
  static async register(req, res, next) {
    try {
      const checkEmail = await prisma.auth.findUnique({
        where: {
          email: email,
        },
        include: {
          user: true,
        },
      });

      if (checkEmail) {
        return next(
          createHttpError(409, {
            message: 'Email has already been taken',
          }),
        );
      }

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
