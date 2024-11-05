import * as argon from 'argon2';
import { UsersRepository } from '../repositories/users.js';
import { ErrorHandler } from '../middlewares/error.js';
import generateJWT from '../utils/jwtGenerate.js';
import { ImageKitService } from './imageKit.js';

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

  static async upsertUserData(data, file, userID) {
    let uploaded = null;

    const userData = await UsersRepository.getUserDataByUserID(userID);

    if (!userData) {
      if (!('identity_type' in file)) {
        throw new ErrorHandler(400, 'no file selected');
      }
    }

    if ('identity_type' in file) {
      if (userData !== null) {
        await ImageKitService.delete(userData.file_id);
      }

      uploaded = await ImageKitService.upload(file, 'users_data', [
        'user',
        'identity',
      ]);
    }

    const createUserData = await UsersRepository.upsertUserData(
      data,
      uploaded,
      userID,
    );

    return createUserData;
  }
}
