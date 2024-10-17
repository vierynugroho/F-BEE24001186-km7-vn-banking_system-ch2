import express from 'express';
import Validator from '../utils/validator.js';
import { TransactionsController } from '../controllers/transactions.js';
import {
  depositSchema,
  transferSchema,
  withdrawalSchema,
} from '../utils/validationSchema.js';

const router = express.Router();

router.route('/').get(TransactionsController.getAllTransactions);
router.route('/:transactionID').get(TransactionsController.getTransaction);
router
  .route('/')
  .post(Validator(transferSchema), TransactionsController.transfer);
router
  .route('/withdrawal/:accountID')
  .post(Validator(withdrawalSchema), TransactionsController.withdrawal);
router
  .route('/deposit/:accountID')
  .post(Validator(depositSchema), TransactionsController.deposit);

export default router;
