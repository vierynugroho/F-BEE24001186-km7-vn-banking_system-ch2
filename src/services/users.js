import * as argon from 'argon2';
import { UsersRepository } from '../repositories/users.js';
import { ErrorHandler } from '../middlewares/error.js';

export class UsersService {
  static async register(data) {
    const user = await UsersRepository.getUser(data.email);

    if (user) {
      throw new ErrorHandler(409, 'Email has already been taken');
    }

    const passwordHashed = await argon.hash(data.password);

    data.password = passwordHashed;

    const userRegister = await UsersRepository.register(data);

    return userRegister;
  }

  static async login(data) {
    const user = await UsersRepository.getUser(data.email);

    if (!user) {
      throw new ErrorHandler(403, 'wrong credential');
    }

    const comparePassword = await argon.verify(user.password, data.password);

    if (!comparePassword) {
      throw new ErrorHandler(403, 'wrong credential');
    }

    return user;
  }

  static async getUsers(pagination) {
    const users = await UsersRepository.getUsers(pagination);
    const totalUser = await UsersRepository.countUsers();

    return { users, totalUser };
  }

  static async getUser(email) {
    const user = await UsersRepository.getUser(email);

    return user;
  }

  static async getUserById(userID) {
    const user = await UsersRepository.getUserById(userID);

    return user;
  }
}
