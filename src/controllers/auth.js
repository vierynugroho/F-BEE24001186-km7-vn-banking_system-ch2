import { AuthService } from '../services/auth.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const data = req.body;

      const userRegister = await AuthService.register(data);

      delete userRegister.user.password;

      res.json({
        meta: {
          statusCode: 200,
          message: 'register successfully',
        },
        data: userRegister,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const data = req.body;

      const { user, token } = await AuthService.login(data);

      delete user.password;

      res.json({
        meta: {
          statusCode: 200,
          message: 'login successfully',
        },
        data: {
          _token: token,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
