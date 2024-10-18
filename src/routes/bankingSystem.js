import express from 'express';
import { BankingSystemController } from '../controllers/bankingSystem.js';
import Validator from '../utils/validator.js';
import {
  depositSchema,
  transferSchema,
  withdrawalSchema,
} from '../utils/validationSchema.js';
const router = express.Router();

router.route('/balance/:id').get(BankingSystemController.getBalance);
router
  .route('/deposit/:id')
  .put(Validator(depositSchema), BankingSystemController.deposit);
router
  .route('/withdrawal/:id')
  .put(Validator(withdrawalSchema), BankingSystemController.withdrawal);
router
  .route('/transfer/:id')
  .put(Validator(transferSchema), BankingSystemController.transfer);
router.route('/log/:id').get(BankingSystemController.log);

export default router;
