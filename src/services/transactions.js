import { ErrorHandler } from '../middlewares/error.js';
import { TransactionsRepository } from '../repositories/transactions.js';
import { formatRupiah } from '../utils/formatRupiah.js';

export class TransactionsService {
  static async getBalance(accountID) {
    const balance = await TransactionsRepository.getBalance(accountID);

    return balance;
  }

  static async transfer(data) {
    const senderID = data.senderID;
    const receiverID = data.receiverID;
    const amount = data.amount;

    const sender = await TransactionsRepository.getAccount(senderID);
    const receiver = await TransactionsRepository.getAccount(receiverID);

    if (!sender) {
      throw new ErrorHandler(404, `account with ID: ${senderID} is not found`);
    }

    if (!receiver) {
      throw new ErrorHandler(
        404,
        `account with ID: ${receiverID} is not found`,
      );
    }

    if (senderID === receiverID && sender.bank_name === receiver.bank_name) {
      throw new ErrorHandler(
        403,
        `transactions between 2 (two) same accounts are not allowed`,
      );
    }

    const insufficient = await TransactionsRepository.insufficient(
      senderID,
      amount,
    );

    if (insufficient) {
      throw new ErrorHandler(400, `account remaining balance is insufficient`);
    }

    const newSenderBalance = parseFloat(sender.balance) - amount;
    const newReceiverBalance = parseFloat(receiver.balance) + amount;

    const senderTransferUpdate = await TransactionsRepository.updateBalance(
      senderID,
      newSenderBalance,
    );
    const receiverTransferUpdate = await TransactionsRepository.updateBalance(
      receiverID,
      newReceiverBalance,
    );

    // add trx data to tbl_trx
    await TransactionsRepository.addToTransaction(senderID, receiverID, amount);

    const trx = {
      amount,
      currentSenderBalance: await formatRupiah(senderTransferUpdate.balance),
      currentReceiverBalance: await formatRupiah(
        receiverTransferUpdate.balance,
      ),
    };

    return trx;
  }

  static async getAllTransactions(pagination) {
    const transactions =
      await TransactionsRepository.getTransactions(pagination);
    const totalTransactions = await TransactionsRepository.countTransactions();

    transactions.map((trx) => {
      delete trx.SourceBankAccounts.Users.password;
      delete trx.DestinationBankAccounts.Users.password;
    });

    return { transactions, totalTransactions };
  }

  static async getTransaction(transactionID) {
    const transaction =
      await TransactionsRepository.getTransaction(transactionID);

    if (!transaction) {
      throw new ErrorHandler(
        404,
        `transaction with id ${transactionID} is not found`,
      );
    }

    delete transaction.SourceBankAccounts.Users.password;
    delete transaction.DestinationBankAccounts.Users.password;

    return transaction;
  }

  static async deposit(accountID, amount) {
    const account = await TransactionsRepository.getAccount(accountID);

    if (!account) {
      throw new ErrorHandler(404, `account with ID: ${accountID} is not found`);
    }

    const newAccountBalance = parseFloat(account.balance) + amount;

    const deposit = await TransactionsRepository.updateBalance(
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
    const account = await TransactionsRepository.getAccount(accountID);

    if (!account) {
      throw new ErrorHandler(404, `account with ID: ${accountID} is not found`);
    }

    const insufficient = await TransactionsRepository.insufficient(
      accountID,
      amount,
    );

    if (insufficient) {
      throw new ErrorHandler(400, `account remaining balance is insufficient`);
    }

    const newAccountBalance = parseFloat(account.balance) - amount;

    const withdrawal = await TransactionsRepository.updateBalance(
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
