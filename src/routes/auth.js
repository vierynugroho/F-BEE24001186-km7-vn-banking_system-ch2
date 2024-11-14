import express from 'express';
import Validator from '../utils/validator.js';
import { loginSchema, registerSchema } from '../utils/validationSchema.js';
import { UsersController } from '../controllers/users.js';
import authentication from '../middlewares/authentication.js';
import { AuthController } from '../controllers/auth.js';
const router = express.Router();

router
  .route('/register')
  .post(Validator(registerSchema), AuthController.register);
router.route('/login').post(Validator(loginSchema), AuthController.login);

router.get('/google', AuthController.googleRedirectAuthorization);
router.get('/google/callback', AuthController.googleLogin);
router
  .route('/authenticate')
  .get(authentication, UsersController.getUserLoggedIn);

export default router;
