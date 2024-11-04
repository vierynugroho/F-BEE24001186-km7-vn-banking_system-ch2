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

  static async getDataUsers(userID) {
    const userData = await prisma.dataUsers.findMany({
      where: {
        userId: userID,
      },
    });

    return userData;
  }

  static async getUserData(fileID, userID) {
    const userData = await prisma.dataUsers.findFirst({
      where: {
        AND: [{ userId: userID }, { file_id: fileID || null }],
      },
    });

    return userData;
  }

  static async upsertUserData(data, uploadedFile, fileID, userID) {
    const updateData = {};
    if (uploadedFile.type) updateData.file_type = uploadedFile.type;
    if (uploadedFile.url) updateData.file_url = uploadedFile.url;
    if (uploadedFile.fileId) updateData.file_id = uploadedFile.fileId;
    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;

    console.log(`userID: ${userID}`);
    const userData = await prisma.dataUsers.upsert({
      where: {
        userId: userID,
      },
      update: updateData,
      create: {
        file_type: uploadedFile.type,
        file_url: uploadedFile.url,
        file_id: uploadedFile.fileId,
        name: data.name,
        description: data.description,
        userId: userID,
      },
    });
    return userData;
  }

  static async deleteUserData(fileID, userID) {
    const userData = await prisma.userDatas.delete({
      where: {
        AND: [{ userId: userID }, { file_id: fileID }],
      },
    });

    return userData;
  }
}
