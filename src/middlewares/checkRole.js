import { ErrorHandler } from './error.js';

export default (allowedRoles) => {
  return async (req, res, next) => {
    let role = req.user !== undefined ? req.user.role : 'CUSTOMER';
    try {
      const user = req.user;
      if (!user) {
        throw new ErrorHandler(
          401,
          'unauthorized, session finished, please re-login',
        );
      }
      if (!allowedRoles.includes(role)) {
        throw new ErrorHandler(
          403,
          'the role you have does not have permission',
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
