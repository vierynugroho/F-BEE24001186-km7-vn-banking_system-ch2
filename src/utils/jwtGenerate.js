import jsonwebtoken from 'jsonwebtoken';

const { sign } = jsonwebtoken;

const generateJWT = (payload) => {
  return sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRED,
  });
};

export default generateJWT;
