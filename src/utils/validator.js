import { ErrorHandler } from '../middlewares/error.js';

export default (schema) => {
  return async (req, res, next) => {
    try {
      const validated = await schema.validateAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error.isJoi) return next(new ErrorHandler(422, error.message));
    }
  };
};
