import express from 'express';
import Validator from '../utils/validator.js';
import { TransactionsController } from '../controllers/transactions.js';

const router = express.Router();

router.route('/').get(TransactionsController.getAllTransactions);
router.route('/').post(TransactionsController.transfer);
router.route('/:transactionID').get(TransactionsController.getTransaction);
router.route('/withdrawal/:accountID').post(TransactionsController.withdrawal);
router.route('/deposit/:accountID').post(TransactionsController.deposit);

export default router;
