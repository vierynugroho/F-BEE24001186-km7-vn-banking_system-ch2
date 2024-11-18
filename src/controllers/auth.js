import { google } from 'googleapis';
import { authorizationUrl, oauthClient } from '../libs/google.js';
import { AuthService } from '../services/auth.js';
import { ErrorHandler } from '../middlewares/error.js';
import * as argon from 'argon2';
import { Notification } from '../libs/socket.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const data = req.body;

      const userRegister = await AuthService.register(data);

      delete userRegister.user.password;

      await Notification.push(
        'register successfully, Verification link has been sent, please check your email',
      );
      res.json({
        meta: {
          statusCode: 200,
          message:
            'register successfully, Verification link has been sent, please check your email',
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

      await Notification.push('Login Successfully!');

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

      await Notification.push('Login Successfully!');

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

  static async resendOTP(req, res, next) {
    try {
      const { token } = req.query;

      if (!token || token === '') {
        throw new ErrorHandler(404, 'token is not found');
      }

      const resendOTP = await AuthService.resendOTP(token);

      await Notification.push(
        'Verification link has been sent, please check your email!',
      );

      res.json({
        meta: {
          statusCode: 200,
          message: 'Verification link has been sent, please check your email',
        },
        data: resendOTP,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyOTP(req, res, next) {
    try {
      const { token } = req.query;
      const { otp } = req.body;

      if (!token) {
        throw new ErrorHandler(
          404,
          'secret token is invalid, check your email or resend OTP',
        );
      }

      const verify = await AuthService.verifyOTP(token, otp);

      await Notification.push(
        'secret token is invalid, check your email or resend OTP',
      );

      res.json({
        meta: {
          statusCode: 200,
          message: 'email verification successfully',
        },
        data: verify,
      });
    } catch (error) {
      next(error);
    }
  }

  static async sendReset(req, res, next) {
    try {
      const { email } = req.body;

      const resetPassword = await AuthService.sendReset(email);

      await Notification.push(
        'reset password link has been sent, please check your email',
      );

      res.json({
        meta: {
          statusCode: 200,
          message: 'reset password link has been sent, please check your email',
        },
        data: resetPassword,
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const { token } = req.query;
      const { password } = req.body;

      if (!token) {
        throw new ErrorHandler(
          404,
          'secret token is invalid, check your email or send reset password again',
        );
      }

      const reset = await AuthService.resetPassword(token, password);

      await Notification.push('password reset successfully');

      res.json({
        meta: {
          statusCode: 200,
          message: 'password reset successfully',
        },
        data: reset,
      });
    } catch (error) {
      next(error);
    }
  }
}
