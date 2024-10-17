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

  static async getTransaction() {}

  static async deposit() {}

  static async withdrawal() {}
}
