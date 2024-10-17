import { prisma } from '../../db/prisma.js';

export class AccountsRepository {
  static async getAccounts(pagination) {
    const accounts = await prisma.bank_Accounts.findMany({
      skip: pagination.offset,
      take: pagination.limit,
      include: {
        users_id: {
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

  static async getAccountById() {}

  static async getAccountByNumber(bank_account_number) {
    const account = await prisma.bank_Accounts.findUnique({
      where: {
        bank_account_number,
      },
      include: {
        users_id: {
          include: {
            Profiles: true,
          },
        },
      },
    });

    return account;
  }
}
