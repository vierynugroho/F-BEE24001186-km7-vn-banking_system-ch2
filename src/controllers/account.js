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

  static async getAccounts() {}

  static async getAccountById() {}
}
