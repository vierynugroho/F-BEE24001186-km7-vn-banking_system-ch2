import { ErrorHandler } from '../middlewares/error.js';
import { BankingSystemService } from '../services/bankingSystem.js';
import { formatRupiah } from '../utils/formatRupiah.js';

export class BankingSystemController {
  static async getBalance(req, res, next) {
    try {
      const accountID = req.params.id;

      if (!accountID) {
        throw new ErrorHandler(400, `account ID is required`);
      }

      const balance = await formatRupiah(
        await BankingSystemService.getBalance(accountID),
      );

      res.json({
        status: true,
        statusCode: 200,
        message: 'get balance successfully',
        data: balance,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deposit(req, res, next) {
    try {
      const accountID = req.params.id;
      const amount = parseFloat(req.body.amount);

      if (!accountID) {
        throw new ErrorHandler(400, `account ID is required`);
      }

      if (!amount) {
        throw new ErrorHandler(400, `amount is required`);
      }

      const deposit = await BankingSystemService.deposit(accountID, amount);

      res.json({
        status: true,
        statusCode: 200,
        message: 'deposit successfully',
        data: deposit,
      });
    } catch (error) {
      next(error);
    }
  }

  static async withdrawal(req, res, next) {
    try {
      const accountID = req.params.id;
      const amount = parseFloat(req.body.amount);

      if (!accountID) {
        throw new ErrorHandler(400, `account ID is required`);
      }

      if (!amount) {
        throw new ErrorHandler(400, `amount is required`);
      }

      const withdrawal = await BankingSystemService.withdrawal(
        accountID,
        amount,
      );

      res.json({
        status: true,
        statusCode: 200,
        message: 'withdrawal successfully',
        data: withdrawal,
      });
    } catch (error) {
      next(error);
    }
  }

  static async transfer(req, res, next) {
    try {
      const senderID = req.params.id;
      const receiverID = req.body.receiverID;
      const amount = parseFloat(req.body.amount);

      console.log(senderID, receiverID, amount);

      if (!senderID) {
        throw new ErrorHandler(400, `sender ID is required`);
      }

      if (!receiverID) {
        throw new ErrorHandler(400, `receiver ID is required`);
      }

      if (!amount) {
        throw new ErrorHandler(400, `amount is required`);
      }

      const transfer = await BankingSystemService.transfer(
        senderID,
        receiverID,
        amount,
      );

      res.json({
        status: true,
        statusCode: 200,
        message: 'transfer successfully',
        data: transfer,
      });
    } catch (error) {
      next(error);
    }
  }

  static async log(req, res, next) {
    try {
      const accountID = req.params.id;

      if (!accountID) {
        throw new ErrorHandler(400, `sender ID is required`);
      }

      const logTrx = await BankingSystemService.log(accountID);

      res.json({
        status: true,
        statusCode: 200,
        message: 'log transaction retrieved successfully',
        data: logTrx,
      });
    } catch (error) {
      next(error);
    }
  }
}
