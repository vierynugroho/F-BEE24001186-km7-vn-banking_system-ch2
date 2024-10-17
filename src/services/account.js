import { ErrorHandler } from '../middlewares/error.js';
import { AccountsRepository } from '../repositories/account.js';
import { UsersRepository } from '../repositories/users.js';

export class AccountsService {
  static async register(data) {
    const account = await AccountsRepository.getAccountByNumberAndBankName(
      data.bank_account_number,
      data.bank_name,
    );

    if (account) {
      delete account.Users.password;
    }

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

  static async getAccounts(pagination) {
    const accounts = await AccountsRepository.getAccounts(pagination);
    const totalAccounts = await AccountsRepository.countAccounts();

    accounts.map((account) => {
      delete account.Users.password;
    });

    return { accounts, totalAccounts };
  }

  static async getAccountById() {}
}
