import express from 'express';
import Validator from '../utils/validator.js';
import { TransactionsController } from '../controllers/transactions.js';
import { transferSchema } from '../utils/validationSchema.js';
import authentication from '../middlewares/authentication.js';

const router = express.Router();

router
  .route('/')
  .get(authentication, TransactionsController.getAllTransactions);
router
  .route('/:transactionID')
  .get(authentication, TransactionsController.getTransaction);
router
  .route('/')
  .post(
    authentication,
    Validator(transferSchema),
    TransactionsController.transfer,
  );

export default router;
