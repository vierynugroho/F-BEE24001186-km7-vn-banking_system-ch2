import { ErrorHandler } from '../middlewares/error.js';
import { TransactionsService } from '../services/transactions.js';

export class TransactionsController {
  static async transfer(req, res, next) {
    try {
      const data = req.body;
      const transfer = await TransactionsService.transfer(data);

      res.json({
        statusCode: 200,
        message: 'transfer transaction successfully',
        data: transfer,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllTransactions(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;

      if (isNaN(page) || isNaN(limit)) {
        throw new ErrorHandler(400, 'page & limit must be a number');
      }

      const offset = (page - 1) * limit;
      const pagination = {
        offset,
        limit,
      };

      const { transactions, totalTransactions } =
        await TransactionsService.getAllTransactions(pagination);

      res.json({
        statusCode: 200,
        message: 'transations data retrieved successfully',
        pagination: {
          totalPage: Math.ceil(totalTransactions / limit),
          currentPage: page,
          pageItems: transactions.length,
          nextPage:
            page < Math.ceil(totalTransactions / limit) ? page + 1 : null,
          prevPage: page > 1 ? page - 1 : null,
        },
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTransaction(req, res, next) {
    try {
      const transactionID = parseFloat(req.params.transactionID);

      if (isNaN(transactionID)) {
        throw new ErrorHandler(400, 'transactionID must be a number');
      }

      const transaction =
        await TransactionsService.getTransaction(transactionID);

      res.json({
        statusCode: 200,
        message: 'transaction data retrieved successfully',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deposit(req, res, next) {
    try {
      const accountID = parseFloat(req.params.accountID);
      const { amount } = req.body;

      if (isNaN(accountID)) {
        throw new ErrorHandler(400, 'accountID must be a number');
      }

      const deposit = await TransactionsService.deposit(accountID, amount);

      res.json({
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
      const accountID = parseFloat(req.params.accountID);
      const { amount } = req.body;

      if (isNaN(accountID)) {
        throw new ErrorHandler(400, 'accountID must be a number');
      }

      const withdrawal = await TransactionsService.withdrawal(
        accountID,
        amount,
      );

      res.json({
        statusCode: 200,
        message: 'withdrawal successfully',
        data: withdrawal,
      });
    } catch (error) {
      next(error);
    }
  }
}
