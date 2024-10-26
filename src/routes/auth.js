import express from 'express';
import Validator from '../utils/validator.js';
import { loginSchema, registerSchema } from '../utils/validationSchema.js';
import { UsersController } from '../controllers/users.js';
import authentication from '../middlewares/authentication.js';
const router = express.Router();

router
  .route('/register')
  .post(authentication, Validator(registerSchema), UsersController.register);
router
  .route('/login')
  .post(authentication, Validator(loginSchema), UsersController.login);
router
  .route('/authentication')
  .get(authentication, UsersController.getUserLoggedIn);

export default router;
