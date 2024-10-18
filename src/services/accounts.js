import { ErrorHandler } from '../middlewares/error.js';
import { AccountsRepository } from '../repositories/accounts.js';
import { TransactionsRepository } from '../repositories/transactions.js';
import { UsersRepository } from '../repositories/users.js';
import { formatRupiah } from '../utils/formatRupiah.js';

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

  static async getAccountById(accountID) {
    const account = await AccountsRepository.getAccountById(accountID);

    if (!account) {
      throw new ErrorHandler(404, `account with id ${accountID} is not found`);
    }

    delete account.Users.password;

    return account;
  }

  static async deleteAccount(userID, accountID) {
    const user = await UsersRepository.getUserById(userID);

    if (!user) {
      throw new ErrorHandler(404, `user with id ${userID} is not found`);
    }

    const account = await AccountsRepository.getAccountById(accountID);

    if (!account) {
      throw new ErrorHandler(404, `account with id ${accountID} is not found`);
    }

    const userAccount = await AccountsRepository.getAccountByUserIDAndAcountID(
      userID,
      accountID,
    );

    if (!userAccount) {
      throw new ErrorHandler(
        403,
        `you doesn't have an access for account  with id ${accountID}`,
      );
    }

    const haveTransaction =
      await TransactionsRepository.accountTransaction(accountID);

    if (haveTransaction) {
      throw new ErrorHandler(
        403,
        `account has transaction data, account cannot be deleted`,
      );
    }

    const deletedUser = await AccountsRepository.deleteAccount(accountID);

    return deletedUser;
  }

  static async deposit(accountID, amount) {
    const account = await AccountsRepository.getAccountById(accountID);

    if (!account) {
      throw new ErrorHandler(404, `account with ID: ${accountID} is not found`);
    }

    const newAccountBalance = parseFloat(account.balance) + amount;

    const deposit = await AccountsRepository.updateBalance(
      accountID,
      newAccountBalance,
    );

    delete deposit.Users.password;

    // add trx data to tbl_trx
    await TransactionsRepository.addToTransaction(accountID, accountID, amount);

    const trx = {
      amount: await formatRupiah(amount),
      currentAccountBalance: deposit,
    };

    return trx;
  }

  static async withdrawal(accountID, amount) {
    const account = await AccountsRepository.getAccountById(accountID);

    if (!account) {
      throw new ErrorHandler(404, `account with ID: ${accountID} is not found`);
    }

    const insufficient = await AccountsRepository.insufficient(
      accountID,
      amount,
    );

    if (insufficient) {
      throw new ErrorHandler(400, `account remaining balance is insufficient`);
    }

    const newAccountBalance = parseFloat(account.balance) - amount;

    const withdrawal = await AccountsRepository.updateBalance(
      accountID,
      newAccountBalance,
    );

    delete withdrawal.Users.password;

    // add trx data to tbl_trx
    await TransactionsRepository.addToTransaction(accountID, accountID, amount);

    const trx = {
      amount: await formatRupiah(amount),
      currentAccountBalance: withdrawal,
    };

    return trx;
  }
}
