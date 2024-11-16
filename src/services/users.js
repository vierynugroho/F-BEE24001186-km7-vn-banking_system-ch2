import { UsersRepository } from '../repositories/users.js';
import { ErrorHandler } from '../middlewares/error.js';
import { ImageKitService } from './imageKit.js';

export class UsersService {
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

  static async deleteUserData(userID) {
    const userData = await UsersRepository.getUserDataByUserID(userID);

    if (!userData) {
      throw new ErrorHandler(404, 'user has not uploaded data');
    }

    await ImageKitService.delete(userData.file_id);

    const deleteData = await UsersRepository.deleteUserData(userID);

    return deleteData;
  }
}
