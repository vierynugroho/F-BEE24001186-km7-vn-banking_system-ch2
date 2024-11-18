import jsonwebtoken from 'jsonwebtoken';
import { ErrorHandler } from '../middlewares/error.js';

export class JWT {
  static async generate(payload) {
    const token = jsonwebtoken.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRED,
    });

    return token;
  }

  static async verify(token) {
    try {
      const payload = jsonwebtoken.verify(token, process.env.JWT_SECRET);

      return payload;
    } catch (err) {
      throw new ErrorHandler(401, `invalid token, ${err.message}`);
    }
  }
}
