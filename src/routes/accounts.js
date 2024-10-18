import express from 'express';
import Validator from '../utils/validator.js';
import {
  deleteAccountSchema,
  depositSchema,
  registerAccountSchema,
  withdrawalSchema,
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
router
  .route('/withdrawal/:accountID')
  .put(Validator(withdrawalSchema), AccountsController.withdrawal);
router
  .route('/deposit/:accountID')
  .put(Validator(depositSchema), AccountsController.deposit);

export default router;
