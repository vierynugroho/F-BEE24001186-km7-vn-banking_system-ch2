import { ErrorHandler } from '../middlewares/error.js';
import { AccountsRepository } from '../repositories/account.js';
import { UsersRepository } from '../repositories/users.js';

export class AccountsService {
  static async register(data) {
    const account = await AccountsRepository.getAccountByNumber(
      data.bank_account_number,
    );

    if (account) {
      throw new ErrorHandler(409, 'Account has already registered');
    }

    const user = await UsersRepository.getUserById(data.userID);

    if (!user) {
      throw new ErrorHandler(404, `Users with id ${data.userID} is not found`);
    }

    const accountRegister = await AccountsRepository.register(data);

    return accountRegister;
  }

  static async getAccounts() {}

  static async getAccountById() {}
}
