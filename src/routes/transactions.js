import express from 'express';
import Validator from '../utils/validator.js';
import { TransactionsController } from '../controllers/transactions.js';
import { transferSchema } from '../utils/validationSchema.js';

const router = express.Router();

router.route('/').get(TransactionsController.getAllTransactions);
router.route('/:transactionID').get(TransactionsController.getTransaction);
router
  .route('/')
  .post(Validator(transferSchema), TransactionsController.transfer);
export default router;
