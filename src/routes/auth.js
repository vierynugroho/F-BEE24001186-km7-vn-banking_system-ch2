import express from 'express';
import Validator from '../utils/validator.js';
import { loginSchema, registerSchema } from '../utils/validationSchema.js';
import { UsersController } from '../controllers/users.js';
import authentication from '../middlewares/authentication.js';
import { AuthController } from '../controllers/auth.js';
const router = express.Router();

router.post('/register', Validator(registerSchema), AuthController.register);
router.post('/login', Validator(loginSchema), AuthController.login);

router.get('/google', AuthController.googleRedirectAuthorization);
router.get('/google/callback', AuthController.googleLogin);

router.get('/verify', AuthController.verifyOTP);
router.post('/resend-otp', AuthController.resendOTP);

router.post('/forget-password', AuthController.sendReset);
router.put('/reset-password', AuthController.resetPassword);

router
  .route('/authenticate')
  .get(authentication, UsersController.getUserLoggedIn);

export default router;
