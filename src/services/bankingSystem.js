import { BankingSystemRepository } from '../repositories/bankingSystem.js';
import { ErrorHandler } from '../utils/errorHandler.js';

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
      throw new ErrorHandler(`account with ID: ${senderID} is not found`, 404);
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
      throw new ErrorHandler(`account with ID: ${senderID} is not found`, 404);
    }

    const insufficient = await BankingSystemRepository.insufficientCheck(
      accountID,
      amount,
    );

    if (insufficient) {
      throw new ErrorHandler(`account remaining balance is insufficient`, 400);
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
      throw new ErrorHandler(`account with ID: ${senderID} is not found`, 404);
    }

    if (!receiver) {
      throw new ErrorHandler(
        `account with ID: ${receiverID} is not found`,
        404,
      );
    }

    const insufficient = await BankingSystemRepository.insufficientCheck(
      senderID,
      amount,
    );

    if (insufficient) {
      throw new ErrorHandler(`account remaining balance is insufficient`, 400);
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
      throw new ErrorHandler(`account with ID: ${accountID} is not found`, 404);
    }

    const log = await BankingSystemRepository.log(accountID);

    return log;
  }
}
