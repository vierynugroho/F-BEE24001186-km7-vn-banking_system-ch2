import * as argon from 'argon2';
import { UsersRepository } from '../repositories/users.js';
import { ErrorHandler } from '../middlewares/error.js';
import generateJWT from '../utils/jwtGenerate.js';
import handleUpload from '../utils/fileUpload.js';

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

  static async uploadData(files) {
    if (!files.length <= 0) {
      throw new ErrorHandler(404, 'file is not found');
    }

    const uploaded = await handleUpload(files);
    console.log(uploaded); // masukkan data ke db
    /*
    {
      identity_type: {
        fileId: '6724cae6e375273f60e92596',
        name: 'identity_type-1730464484192_nwBCvVGUH.png',
        size: 175596,
        versionInfo: { id: '6724cae6e375273f60e92596', name: 'Version 1' },
        filePath: '/users_data/identity_type-1730464484192_nwBCvVGUH.png',
        url: 'https://ik.imagekit.io/vieryn/users_data/identity_type-1730464484192_nwBCvVGUH.png',
        fileType: 'image',
        height: 2000,
        width: 2000,
        thumbnailUrl: 'https://ik.imagekit.io/vieryn/tr:n-ik_ml_thumbnail/users_data/identity_type-1730464484192_nwBCvVGUH.png',
        AITags: null
      },
      profile_picture: null
    }
    */
    return uploaded;
  }
}
