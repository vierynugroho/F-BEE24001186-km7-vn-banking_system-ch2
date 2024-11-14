import { prisma } from '../libs/prisma.js';

export class AuthRepository {
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
}
