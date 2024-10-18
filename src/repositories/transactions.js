import { prisma } from '../lib/prisma.js';

export class TransactionsRepository {
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

  static async accountTransaction(accountID) {
    const accountTrx = await prisma.transactions.findMany({
      where: {
        OR: [
          {
            source_account_id: accountID,
          },
          {
            destination_account_id: accountID,
          },
        ],
      },
    });

    const haveTransaction = accountTrx.length === 0 ? false : true;

    return haveTransaction;
  }

  static async countTransactions() {
    const totalTransactions = await prisma.transactions.count();

    return totalTransactions;
  }
}
