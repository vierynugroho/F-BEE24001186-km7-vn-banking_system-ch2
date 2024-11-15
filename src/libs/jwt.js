import jsonwebtoken from 'jsonwebtoken';

export class JWT {
  static async generate(payload) {
    const token = jsonwebtoken.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRED,
    });

    return token;
  }

  static async verify(token) {
    const payload = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    return payload;
  }
}
