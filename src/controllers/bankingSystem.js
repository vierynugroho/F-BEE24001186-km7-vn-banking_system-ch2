import { BankingSystemService } from '../services/bankingSystem.js';
import { ErrorHandler } from '../utils/errorHandler.js';
import { formatRupiah } from '../utils/formatRupiah.js';

export class BankingSystemController {
  static async getBalance(req, res, next) {
    try {
      const accountID = req.params.id;

      if (!accountID) {
        return next(new ErrorHandler(`account ID is required`, 400));
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
      next(new ErrorHandler(error.message, error.statusCode));
    }
  }

  static async deposit(req, res, next) {
    try {
      const accountID = req.params.id;
      const amount = parseFloat(req.body.amount);

      if (!accountID) {
        return next(new ErrorHandler(`account ID is required`, 400));
      }

      if (!amount) {
        return next(new ErrorHandler(`amount is required`, 400));
      }

      const deposit = await BankingSystemService.deposit(accountID, amount);

      res.json({
        status: true,
        statusCode: 200,
        message: 'deposit successfully',
        data: deposit,
      });
    } catch (error) {
      next(new ErrorHandler(error.message, error.statusCode));
    }
  }

  static async withdrawal(req, res, next) {
    try {
      const accountID = req.params.id;
      const amount = parseFloat(req.body.amount);

      if (!accountID) {
        return next(new ErrorHandler(`account ID is required`, 400));
      }

      if (!amount) {
        return next(new ErrorHandler(`amount is required`, 400));
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
      next(new ErrorHandler(error.message, error.statusCode));
    }
  }

  static async transfer(req, res, next) {
    try {
      const senderID = req.params.id;
      const receiverID = req.body.receiverID;
      const amount = parseFloat(req.body.amount);

      console.log(senderID, receiverID, amount);

      if (!senderID) {
        return next(new ErrorHandler(`sender ID is required`, 400));
      }

      if (!receiverID) {
        return next(new ErrorHandler(`receiver ID is required`, 400));
      }

      if (!amount) {
        return next(new ErrorHandler(`amount is required`, 400));
      }

      const transfer = await BankingSystemService.transfer(
        senderID,
        receiverID,
        amount,
      );

      res.json({
        status: true,
        statusCode: 200,
        message: 'deposit successfully',
        data: transfer,
      });
    } catch (error) {
      next(new ErrorHandler(error.message, error.statusCode));
    }
  }

  static async log(req, res, next) {
    try {
      const accountID = req.params.id;

      if (!accountID) {
        return next(new ErrorHandler(`sender ID is required`, 400));
      }

      const logTrx = await BankingSystemService.log(accountID);

      res.json({
        status: true,
        statusCode: 200,
        message: 'log transaction successfully',
        data: logTrx,
      });
    } catch (error) {
      next(new ErrorHandler(error.message, error.statusCode));
    }
  }
}
