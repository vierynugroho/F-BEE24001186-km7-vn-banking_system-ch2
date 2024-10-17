import express from 'express';
import Validator from '../utils/validator.js';
import { registerAccountSchema } from '../utils/validationSchema.js';
import { AccountsController } from '../controllers/account.js';

const router = express.Router();

router.route('/').get(AccountsController.getAccounts);
router.route('/:accountID').get(AccountsController.getAccountById);
router
  .route('/')
  .post(Validator(registerAccountSchema), AccountsController.register);

export default router;
