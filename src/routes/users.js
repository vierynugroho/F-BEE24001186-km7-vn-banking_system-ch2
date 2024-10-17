import express from 'express';
import Validator from '../utils/validator.js';
import { loginSchema, registerSchema } from '../utils/validationSchema.js';
import { UsersController } from '../controllers/users.js';
const router = express.Router();

router.route('/').get(UsersController.getUsers);
router.route('/:userId').get(UsersController.getUserById);
router.route('/').post(Validator(registerSchema), UsersController.register);
router.route('/login').post(Validator(loginSchema), UsersController.login);

export default router;
