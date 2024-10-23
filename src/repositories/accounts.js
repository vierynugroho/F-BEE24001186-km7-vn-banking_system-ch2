import { prisma } from '../lib/prisma.js';

export class AccountsRepository {
  static async getBalance(accountID) {
    const account = await prisma.bank_Accounts.findUnique({
      where: {
        id: accountID,
      },
    });

    return account.balance;
  }

  static async getAccounts(pagination) {
    const accounts = await prisma.bank_Accounts.findMany({
      skip: pagination.offset,
      take: pagination.limit,
      include: {
        Users: {
          include: {
            Profiles: true,
          },
        },
      },
    });

    return accounts;
  }

  static async countAccounts() {
    const totalAccounts = await prisma.bank_Accounts.count();

    return totalAccounts;
  }

  static async register(data) {
    const accountRegister = await prisma.$transaction(async (tx) => {
      const user = await tx.users.findUnique({
        where: {
          id: data.userID,
        },
      });

      const bank_account = await tx.bank_Accounts.create({
        data: {
          user_id: user.id,
          bank_name: data.bank_name,
          bank_account_number: data.bank_account_number,
          balance: data.balance,
        },
      });

      return bank_account;
    });

    return accountRegister;
  }

  static async getAccountById(accountID) {
    const user = await prisma.bank_Accounts.findUnique({
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

    return user;
  }

  static async getAccountByNumber(bank_account_number) {
    const user = await prisma.bank_Accounts.findFirst({
      where: {
        bank_account_number,
      },
      include: {
        Users: {
          include: {
            Profiles: true,
          },
        },
      },
    });

    return user;
  }

  static async getAccountByNumberAndBankName(bank_account_number, bank_name) {
    const account = await prisma.bank_Accounts.findFirst({
      where: {
        AND: [{ bank_account_number }, { bank_name }],
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

  static async getAccountByUserIDAndAcountID(userID, accountID) {
    const account = await prisma.bank_Accounts.findFirst({
      where: {
        AND: [{ user_id: userID }, { id: accountID }],
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

  static async deleteAccount(accountID) {
    const account = await prisma.bank_Accounts.delete({
      where: {
        id: accountID,
      },
    });

    return account;
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

  static async insufficient(accountID, amount) {
    const balance = await this.getBalance(accountID);
    const insufficient = amount > balance ? true : false;

    return insufficient;
  }
}
