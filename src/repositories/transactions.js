import { prisma } from '../lib/prisma.js';

export class TransactionsRepository {
  static async getBalance(accountID) {
    const account = await prisma.bank_Accounts.findUnique({
      where: {
        id: accountID,
      },
    });

    return account.balance;
  }

  static async getAccount(accountID) {
    const getAccount = await prisma.bank_Accounts.findUnique({
      where: {
        id: accountID,
      },
      include: {
        Users: {
          include: {
            Profiles: true,
          },
        },
      },
    });

    const account = getAccount === null ? false : getAccount;
    return account;
  }

  static async insufficient(accountID, amount) {
    const balance = await this.getBalance(accountID);
    const insufficient = amount > balance ? true : false;

    return insufficient;
  }

  static async updateBalance(accountID, newBalance) {
    const account = await prisma.bank_Accounts.update({
      where: {
        id: accountID,
      },
      data: {
        balance: newBalance,
      },
      include: {
        Users: {
          include: {
            Profiles: true,
          },
        },
      },
    });

    return account;
  }

  static async addToTransaction(senderID, receiverID, amount) {
    const transaction = await prisma.transactions.create({
      data: {
        source_account_id: senderID,
        destination_account_id: receiverID,
        amount,
      },
    });

    return transaction;
  }

  static async getTransactions(pagination) {
    const transactions = await prisma.transactions.findMany({
      skip: pagination.offset,
      take: pagination.limit,
      include: {
        SourceBankAccounts: {
          include: {
            Users: {
              include: {
                Profiles: true,
              },
            },
          },
        },
        DestinationBankAccounts: {
          include: {
            Users: {
              include: {
                Profiles: true,
              },
            },
          },
        },
      },
    });

    console.log(transactions);
    return transactions;
  }

  static async getTransaction(transactionID) {
    const transaction = await prisma.transactions.findUnique({
      where: {
        id: transactionID,
      },
      include: {
        SourceBankAccounts: {
          include: {
            Users: {
              include: {
                Profiles: true,
              },
            },
          },
        },
        DestinationBankAccounts: {
          include: {
            Users: {
              include: {
                Profiles: true,
              },
            },
          },
        },
      },
    });

    return transaction;
  }

  static async countTransactions() {
    const totalTransactions = await prisma.transactions.count();

    return totalTransactions;
  }
}
