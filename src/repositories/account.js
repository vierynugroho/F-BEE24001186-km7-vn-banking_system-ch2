import { prisma } from '../../db/prisma.js';

export class AccountsRepository {
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

  static async getAccountById() {}

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

    if (account) {
      delete account.Users.password;
    }

    return account;
  }
}
