import { google } from 'googleapis';
import { authorizationUrl, oauthClient } from '../libs/google.js';
import { AuthService } from '../services/auth.js';
import { ErrorHandler } from '../middlewares/error.js';
import * as argon from 'argon2';

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

  static async googleLogin(req, res, next) {
    try {
      const { code } = req.query;
      const { tokens } = await oauthClient.getToken(code);

      oauthClient.setCredentials(tokens);

      const oauth2 = google.oauth2({
        auth: oauthClient,
        version: 'v2',
      });

      const { data } = await oauth2.userinfo.get();

      if (!data) {
        throw new ErrorHandler(404, 'google account is not found');
      }

      let registerData = {
        ...data,
        password: await argon.hash(data.id),
        isVerified: true,
      };

      const userInfo = await AuthService.googleLogin(registerData);

      res.json({
        meta: {
          statusCode: 200,
          message: 'authentication successfully',
        },
        data: userInfo,
      });
    } catch (error) {
      next(error);
    }
  }

  static async googleRedirectAuthorization(req, res, next) {
    try {
      res.redirect(authorizationUrl);
    } catch (error) {
      next(error);
    }
  }

  static async resendOTP() {}

  static async verifyOTP(req, res, next) {
    try {
      const { token } = req.query;
      const { otp } = req.body;

      const verify = await AuthService.verifyOTP(token, otp);

      res.json({
        meta: {
          statusCode: 200,
          message: 'email activated successfully',
        },
        data: verify,
      });
    } catch (error) {
      next(error);
    }
  }

  static async sendReset() {}

  static async resetPassword() {}
}
