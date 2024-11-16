import { prisma } from '../libs/prisma.js';

export class AuthRepository {
  static async register(data) {
    const userRegister = await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.password,
          secretToken: data.secretToken,
          OTPToken: data.OTPToken,
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

  static async googleSignIn(data) {
    const googleDataSignIn = await prisma.users.upsert({
      where: {
        email: data.email,
      },
      update: {
        name: data.name,
        email: data.email,
        password: data.password,
        isVerified: data.isVerified,
      },
      create: {
        name: data.name,
        email: data.email,
        password: data.password,
        isVerified: data.isVerified,
        Profiles: {
          create: {
            identity_number: data.identity_number,
            identity_type: data.identity_type,
            address: data.identity_number,
          },
        },
      },
    });

    return googleDataSignIn;
  }

  static async getUserByEmail(email) {
    const user = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    return user;
  }

  static async verify(email) {
    const verify = await prisma.users.update({
      where: {
        email,
      },
      data: {
        isVerified: true,
        secretToken: null,
        OTPToken: null,
      },
    });

    return verify;
  }

  static async updateOTP(email, OTPToken) {
    const otpUpdate = await prisma.users.update({
      where: {
        email,
      },
      data: {
        OTPToken,
      },
    });

    return otpUpdate;
  }
}
