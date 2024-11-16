import { prisma } from '../libs/prisma.js';
import { ErrorHandler } from './error.js';
import { JWT } from '../libs/jwt.js';

export default async (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization;

    if (!bearerToken) {
      throw new ErrorHandler(401, 'unauthorized, token is not found');
    }

    const token = bearerToken.split('Bearer ')[1];

    const payload = await JWT.verify(token);

    const user = await prisma.users.findUnique({
      where: {
        id: payload.id,
      },
      include: {
        Profiles: true,
      },
    });

    delete user.password;

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};
