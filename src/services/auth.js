import * as argon from 'argon2';
import { UsersRepository } from '../repositories/users.js';
import { AuthRepository } from '../repositories/auth.js';
import { ErrorHandler } from '../middlewares/error.js';
import generateJWT from '../utils/jwtGenerate.js';
import { OTP } from '../libs/totp.js';
import { EmailService } from '../libs/nodemailer.js';

export class AuthService {
  static async register(data) {
    const user = await UsersRepository.getUser(data.email);

    if (user) {
      throw new ErrorHandler(409, 'Email has already been taken');
    }

    const passwordHashed = await argon.hash(data.password);

    // [start] email verification
    const verificationPayload = {
      email: user.email,
      id: user.id,
      emailTitle: 'Email Activation',
    };

    const verificationToken = generateJWT(verificationPayload); // secret
    const OTPToken = await OTP.generateOTP();

    //TODO: upsert into db

    data.OTPToken = OTPToken;
    data.secretToken = verificationToken;
    data.password = passwordHashed;
    const userRegister = await AuthRepository.register(data);

    //TODO: send email
    if (userRegister) {
      await EmailService.send('viery15102002@gmail.com', 'test', '<p>TEST</p>');
    }
    // [end] email verification

    return userRegister;
  }

  static async googleLogin(data) {
    console.log(data);
    /*
    {
      id: '105469596566547305919',
      email: 'viery15102002@gmail.com',
      verified_email: true,
      name: 'Viery Nugroho',
      given_name: 'Viery',
      family_name: 'Nugroho',
      picture: 'https://lh3.googleusercontent.com/a/ACg8ocJS36Gjind39n6Xizvln21hRkhEnZgTG_DkC7ShlwbZOlesT6Oj=s96-c',
      password: '$argon2id$v=19$m=65536,t=3,p=4$GTxXiPW96Kwpf1OPjixiLg$8sUt84rwMiaxb/94xghfkDvvayommQ0R8ZBBvXcTLv0'
    }
    */
    // set user profiles default value
    // insert into DB
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

    const token = generateJWT(payload);

    return { user, token };
  }

  static async resendOTP() {}

  static async verifyOTP() {}

  static async resetPassword() {}

  static async sendReset() {}
}
