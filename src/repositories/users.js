import { prisma } from '../libs/prisma.js';

export class UsersRepository {
  static async getUsers(pagination) {
    const users = await prisma.users.findMany({
      skip: pagination.offset,
      take: pagination.limit,
      include: {
        Profiles: true,
      },
    });

    return users;
  }

  static async countUsers() {
    const totalUsers = await prisma.users.count();

    return totalUsers;
  }

  static async getUser(email) {
    const user = await prisma.users.findUnique({
      where: {
        email,
      },
      include: {
        Profiles: true,
      },
    });

    return user;
  }

  static async getUserById(userID) {
    const user = await prisma.users.findUnique({
      where: {
        id: userID,
      },
      include: {
        Profiles: true,
      },
    });

    return user;
  }

  static async register(data) {
    const userRegister = await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.password,
        },
      });

      const profile = await tx.profiles.create({
        data: {
          user_id: user.id,
          identity_type: data.identity_type,
          identity_number: data.identity_number,
          address: data.address,
        },
      });

      return { user, profile };
    });

    return userRegister;
  }

  static async addUserData(data, userID) {
    const userData = await prisma.userDatas.create({
      data: {
        file_type: '',
        file_url: '',
        file_id: data.file_id,
        name,
        description,
        userId: userID,
      },
    });
    return userData;
  }

  static async updateUserData(data, userID) {
    return { data, userID };
  }
  static async deleteUserData(fileID, userID) {
    return { data, userID };
  }
}
