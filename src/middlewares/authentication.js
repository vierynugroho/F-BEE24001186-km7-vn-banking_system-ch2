import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { ErrorHandler } from './error.js';

export default async (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization;

    if (!bearerToken) {
      throw new ErrorHandler(401, 'unauthorized, token is not found');
    }

    const token = bearerToken.split('Bearer ')[1];

    const payload = jwt.verify(token, process.env.JWT_SECRET);

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

    if (req.user === null) {
      throw new ErrorHandler(
        401,
        'unauthorized, session finished, please re-login',
      );
    }
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ErrorHandler(401, 'Token expired, please re-login'));
    } else if (error instanceof jwt.NotBeforeError) {
      return next(new ErrorHandler(401, 'Token not active, please re-login'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      return next(new ErrorHandler(400, `${error.message}, please re-login`));
    }
    next(error);
  }
};
