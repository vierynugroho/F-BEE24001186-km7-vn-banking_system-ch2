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

  static async getUserDataByUserID(userID) {
    const userData = await prisma.dataUsers.findFirst({
      where: {
        userId: userID,
      },
    });

    return userData;
  }

  static async upsertUserData(data, uploadedFile, userID) {
    const updateData = {};

    if (!uploadedFile) {
      const file = await this.getUserDataByUserID(userID);
      if (file) {
        uploadedFile = {
          identity_type: {
            fileType: file.file_type,
            fileId: file.file_id,
            url: file.file_url,
          },
        };
      }
    }

    if (uploadedFile?.identity_type) {
      updateData.file_type = uploadedFile.identity_type.fileType || null;
      updateData.file_url = uploadedFile.identity_type.url || null;
      updateData.file_id = uploadedFile.identity_type.fileId || null;
    }

    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    updateData.userId = userID;

    const userData = await prisma.dataUsers.upsert({
      where: {
        userId: userID,
      },
      update: updateData,
      create: {
        file_type: uploadedFile?.identity_type?.fileType || null,
        file_url: uploadedFile?.identity_type?.url || null,
        file_id: uploadedFile?.identity_type?.fileId || null,
        name: data.name || null,
        description: data.description || null,
        userId: userID,
      },
    });

    return userData;
  }

  static async deleteUserData(userID) {
    const userData = await prisma.dataUsers.delete({
      where: { userId: userID },
    });

    return userData;
  }
}
