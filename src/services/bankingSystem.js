import { ErrorHandler } from '../middlewares/error.js';
import { BankingSystemRepository } from '../repositories/bankingSystem.js';

export class BankingSystemService {
  static async getBalance(accountID) {
    const account = await BankingSystemRepository.getAccount(accountID);

    if (!account) {
      throw new ErrorHandler(`account with ID: ${accountID} is not found`, 404);
    }

    const balance = await BankingSystemRepository.getBalance(accountID);

    return balance;
  }

  static async deposit(accountID, amount) {
    const account = await BankingSystemRepository.getAccount(accountID);

    if (!account) {
      throw new ErrorHandler(404, `account with ID: ${accountID} is not found`);
    }

    const accountBalance = await BankingSystemRepository.getBalance(accountID);

    const newAccountBalance = parseFloat(accountBalance) + amount;

    const accountDeposit = await BankingSystemRepository.updateBalance(
      accountID,
      newAccountBalance,
    );

    const trx = {
      amount: amount,
      currentAccountBalance: accountDeposit,
    };

    return trx;
  }

  static async withdrawal(accountID, amount) {
    const account = await BankingSystemRepository.getAccount(accountID);

    if (!account) {
      throw new ErrorHandler(404, `account with ID: ${senderID} is not found`);
    }

    const insufficient = await BankingSystemRepository.insufficientCheck(
      accountID,
      amount,
    );

    if (insufficient) {
      throw new ErrorHandler(400, `account remaining balance is insufficient`);
    }

    const accountBalance = await BankingSystemRepository.getBalance(accountID);

    const newAccountBalance = parseFloat(accountBalance) - amount;

    const accountWithdrawal = await BankingSystemRepository.updateBalance(
      accountID,
      newAccountBalance,
    );

    const trx = {
      amount: amount,
      currentAccountBalance: accountWithdrawal,
    };

    return trx;
  }

  static async transfer(senderID, receiverID, amount) {
    const sender = await BankingSystemRepository.getAccount(senderID);
    const receiver = await BankingSystemRepository.getAccount(receiverID);

    if (!sender) {
      throw new ErrorHandler(404, `account with ID: ${senderID} is not found`);
    }

    if (!receiver) {
      throw new ErrorHandler(
        404,
        `account with ID: ${receiverID} is not found`,
      );
    }

    const insufficient = await BankingSystemRepository.insufficientCheck(
      senderID,
      amount,
    );

    if (insufficient) {
      throw new ErrorHandler(400, `account remaining balance is insufficient`);
    }

    const senderBalance = await BankingSystemRepository.getBalance(senderID);
    const receiverBalance =
      await BankingSystemRepository.getBalance(receiverID);

    const newSenderBalance = parseFloat(senderBalance) - amount;
    const newReceiverBalance = parseFloat(receiverBalance) + amount;

    const senderDeposit = await BankingSystemRepository.updateBalance(
      senderID,
      newSenderBalance,
    );

    const receiverDeposit = await BankingSystemRepository.updateBalance(
      receiverID,
      newReceiverBalance,
    );

    const trx = {
      amount: amount,
      currentSenderBalance: senderDeposit,
      currentReceiverBalance: receiverDeposit,
    };

    return trx;
  }

  static async log(accountID) {
    const account = await BankingSystemRepository.getAccount(accountID);

    if (!account) {
      throw new ErrorHandler(404, `account with ID: ${accountID} is not found`);
    }

    const log = await BankingSystemRepository.log(accountID);

    return log;
  }
}
