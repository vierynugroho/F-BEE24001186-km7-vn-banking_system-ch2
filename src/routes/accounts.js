import express from 'express';
import Validator from '../utils/validator.js';
import {
  deleteAccountSchema,
  registerAccountSchema,
} from '../utils/validationSchema.js';
import { AccountsController } from '../controllers/accounts.js';

const router = express.Router();

router.route('/').get(AccountsController.getAccounts);
router.route('/:accountID').get(AccountsController.getAccountById);
router
  .route('/')
  .post(Validator(registerAccountSchema), AccountsController.register);
router
  .route('/:userID')
  .delete(Validator(deleteAccountSchema), AccountsController.deleteAccount);
export default router;
