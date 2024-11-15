import * as argon from 'argon2';
import { UsersRepository } from '../repositories/users.js';
import { AuthRepository } from '../repositories/auth.js';
import { ErrorHandler } from '../middlewares/error.js';
import { OTP } from '../libs/totp.js';
import { EmailService } from '../libs/nodemailer.js';
import { JWT } from '../libs/jwt.js';
// import { Notification } from '../libs/socket.js';

export class AuthService {
  static async register(data) {
    const user = await UsersRepository.getUser(data.email);

    if (user) {
      throw new ErrorHandler(409, 'Email has already been taken');
    }

    const passwordHashed = await argon.hash(data.password);

    // [start] email verification
    //TODO: upsert into db
    const OTPToken = await OTP.generateOTP();

    const verificationPayload = {
      email: data.email,
      emailTitle: 'Email Activation',
    };
    const verificationToken = await JWT.generate(verificationPayload); // secret

    data.OTPToken = OTPToken;
    data.secretToken = verificationToken;
    data.password = passwordHashed;

    const userRegister = await AuthRepository.register(data);

    const html = await EmailService.getTemplate('verify.ejs', {
      email: userRegister.user.email,
      OTPToken: userRegister.user.OTPToken,
      urlTokenVerification: `${process.env.BASE_URL_FRONTEND}/otp?token=${userRegister.user.secretToken}`,
    });

    //TODO: send email
    await EmailService.send(
      'viery15102002@gmail.com',
      verificationPayload.emailTitle,
      html,
    );
    // [end] email verification
    // await Notification.push(
    //   'register',
    //   'Verification email sent to your email',
    // );
    return userRegister;
  }

  static async googleLogin(data) {
    const userInfo = await AuthRepository.googleSignIn(data);

    const tokenPayload = {
      id: userInfo.id,
      name: userInfo.name,
      role: userInfo.role,
      email: userInfo.email,
    };

    const token = await JWT.generate(tokenPayload);

    let googleLoginData = {
      _token: token,
      ...userInfo,
    };

    return googleLoginData;
  }

  static async login(data) {
    const user = await UsersRepository.getUser(data.email);

    if (!user) {
      throw new ErrorHandler(401, 'wrong credential');
    }

    const comparePassword = await argon.verify(user.password, data.password);

    if (!comparePassword) {
      throw new ErrorHandler(401, 'wrong credential');
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.Profiles.address,
      identity_number: user.Profiles.identity_number,
      identity_type: user.Profiles.identity_type,
    };

    const token = await JWT.generate(payload);

    return { user, token };
  }

  static async resendOTP() {}

  static async verifyOTP(token, OTPToken) {
    const payload = await JWT.verify(token);

    console.log(payload);
    // check if payload found user data
    /*
      {
        email: 'viery15102002@gmail.com',
        emailTitle: 'Email Activation',
        iat: 1731692803,
        exp: 1731779203
      } 
    */

    const user = await AuthRepository.getUserByEmail(payload.email);
    // check otp
    if (OTPToken !== user.OTPToken) {
      throw new ErrorHandler(403, 'wrong credential');
    }

    if (user.isVerified) {
      throw new ErrorHandler(403, 'user is already verified');
    }

    // validate otp token
    let delta = OTP.validate(OTPToken);

    if (delta === null) {
      throw new ErrorHandler(403, 'OTP Token is expired');
    }

    const verifyUser = await AuthRepository.verify(payload.email);

    delete verifyUser.password;

    return verifyUser;
  }

  static async resetPassword() {}

  static async sendReset() {}
}
