import express from 'express';
import Validator from '../utils/validator.js';
import {
  deleteAccountSchema,
  depositSchema,
  registerAccountSchema,
  withdrawalSchema,
} from '../utils/validationSchema.js';
import { AccountsController } from '../controllers/accounts.js';
import authentication from '../middlewares/authentication.js';
import CheckRole from '../middlewares/checkRole.js';

const router = express.Router();

router
  .route('/')
  .get(authentication, CheckRole(['ADMIN']), AccountsController.getAccounts);
router
  .route('/:accountID')
  .get(authentication, AccountsController.getAccountById);
router
  .route('/')
  .post(
    authentication,
    Validator(registerAccountSchema),
    AccountsController.register,
  );
router
  .route('/:userID')
  .delete(
    authentication,
    Validator(deleteAccountSchema),
    AccountsController.deleteAccount,
  );
router
  .route('/withdrawal/:accountID')
  .put(
    authentication,
    Validator(withdrawalSchema),
    AccountsController.withdrawal,
  );
router
  .route('/deposit/:accountID')
  .put(authentication, Validator(depositSchema), AccountsController.deposit);

export default router;
