import { ErrorHandler } from '../middlewares/error.js';
import { AccountsService } from '../services/accounts.js';
import { TransactionsService } from '../services/transactions.js';

export class TransactionsController {
  static async transfer(req, res, next) {
    try {
      const userLoggedIn = req.user;
      const data = req.body;

      const account = await AccountsService.getAccountById(data.senderID);

      if (account.user_id !== userLoggedIn.id) {
        throw new ErrorHandler(
          403,
          `you doesn't have an access for this account`,
        );
      }

      const transfer = await TransactionsService.transfer(data);

      res.json({
        meta: {
          statusCode: 200,
          message: 'transfer transaction successfully',
        },
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
        meta: {
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
      const userLoggedIn = req.user;

      if (isNaN(transactionID)) {
        throw new ErrorHandler(400, 'transactionID must be a number');
      }

      const accounts = await AccountsService.getAccountByUserID(
        userLoggedIn.id,
      );

      const transaction =
        await TransactionsService.getTransaction(transactionID);

      if (userLoggedIn.role === 'CUSTOMER') {
        if (
          accounts[0].id !== transaction.source_account_id &&
          accounts[0].id !== transaction.destination_account_id
        ) {
          throw new ErrorHandler(
            403,
            `you doesn't have an access for this data`,
          );
        }
      }

      res.json({
        meta: {
          statusCode: 200,
          message: 'transaction data retrieved successfully',
        },
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }
}
