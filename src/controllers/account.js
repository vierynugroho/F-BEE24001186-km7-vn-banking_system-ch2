import { ErrorHandler } from '../middlewares/error.js';
import { AccountsService } from '../services/account.js';

export class AccountsController {
  static async register(req, res, next) {
    try {
      const data = req.body;
      const accountRegister = await AccountsService.register(data);

      res.json({
        statusCode: 200,
        message: 'register successfully',
        data: accountRegister,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAccounts(req, res, next) {
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

      const { accounts, totalAccounts } =
        await AccountsService.getAccounts(pagination);

      accounts.map((account) => {
        delete account.Users.password;
      });

      res.json({
        statusCode: 200,
        message: 'accounts data retrieved successfully',
        pagination: {
          totalPage: Math.ceil(totalAccounts / limit),
          currentPage: page,
          pageItems: accounts.length,
          nextPage: page < Math.ceil(totalAccounts / limit) ? page + 1 : null,
          prevPage: page > 1 ? page - 1 : null,
        },
        data: accounts,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAccountById(req, res, next) {}
}
