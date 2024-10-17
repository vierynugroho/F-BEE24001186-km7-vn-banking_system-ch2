import express from 'express';
import Validator from '../utils/validator.js';
import { loginSchema, registerSchema } from '../utils/validationSchema.js';
const router = express.Router();

// router.route('/register').post(Validator(registerSchema));
// router.route('/login').post(Validator(loginSchema));
export default router;
