import * as argon from 'argon2';
import { prisma } from '../../db/prisma.js';
import { ErrorHandler } from '../middlewares/error.js';

export class UsersController {
  static async register(req, res, next) {
    try {
      const { email, password, name, identity_type, identity_number, address } =
        req.body;

      const emailUsed = await prisma.users.findUnique({
        where: {
          email: email,
        },
      });

      if (emailUsed) {
        throw new ErrorHandler(409, 'Email has already been taken');
      }

      const passwordHashed = await argon.hash(password);

      const registerUser = await prisma.$transaction(async (tx) => {
        const user = await tx.users.create({
          data: {
            name,
            email,
            password: passwordHashed,
          },
        });

        const profile = await tx.profiles.create({
          data: {
            user_id: user.id,
            identity_type,
            identity_number,
            address,
          },
        });

        return { user, profile };
      });

      delete registerUser.user.password;

      res.json({
        status: true,
        statusCode: 200,
        message: 'register successfully',
        data: registerUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      res.json({
        status: true,
        statusCode: 200,
        message: 'login successfully',
        data: '',
      });
    } catch (error) {
      next(error);
    }
  }
}
