import * as argon from 'argon2';
import { UsersRepository } from '../repositories/users.js';
import { AuthRepository } from '../repositories/auth.js';
import { ErrorHandler } from '../middlewares/error.js';
import generateJWT from '../utils/jwtGenerate.js';

export class AuthService {
  static async register(data) {
    const user = await UsersRepository.getUser(data.email);

    if (user) {
      throw new ErrorHandler(409, 'Email has already been taken');
    }

    const passwordHashed = await argon.hash(data.password);

    data.password = passwordHashed;

    const userRegister = await AuthRepository.register(data);

    return userRegister;
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
}
