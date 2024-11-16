import express from 'express';
import Validator from '../utils/validator.js';
import { TransactionsController } from '../controllers/transactions.js';
import { transferSchema } from '../utils/validationSchema.js';
import authentication from '../middlewares/authentication.js';
import CheckRole from '../middlewares/checkRole.js';

const router = express.Router();

router
  .route('/')
  .get(
    authentication,
    CheckRole(['ADMIN']),
    TransactionsController.getAllTransactions,
  )
  .post(
    authentication,
    Validator(transferSchema),
    TransactionsController.transfer,
  );

router
  .route('/:transactionID')
  .get(authentication, TransactionsController.getTransaction);

export default router;
