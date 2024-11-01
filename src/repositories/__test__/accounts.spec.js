import { prisma } from '../../libs/prisma.js';
import { AccountsRepository } from '../accounts.js';

jest.mock('../../libs/prisma.js', () => ({
  prisma: {
    $transaction: jest.fn(),
    users: {
      findUnique: jest.fn(),
    },
    bank_Accounts: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('Accounts Repository', () => {
  const mockAccounts = [
    {
      id: 1,
      balance: 1000.0,
      Users: {
        id: 1,
        name: 'User 1',
        Profiles: {
          id: 1,
          identity_type: 'KTP',
          identity_number: '123456789',
          address: 'Address 1',
        },
      },
    },
    {
      id: 2,
      balance: 2000.0,
      Users: {
        id: 2,
        name: 'User 2',
        Profiles: {
          id: 2,
          identity_type: 'SIM',
          identity_number: '987654321',
          address: 'Address 2',
        },
      },
    },
  ];

  const pagination = { limit: 10, offset: 0 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get balance', () => {
    test('should return the balance for the specified accountID', async () => {
      const accountID = 1;
      const mockAccount = {
        id: accountID,
        balance: 1000.0,
      };
      prisma.bank_Accounts.findUnique.mockResolvedValueOnce(mockAccount);

      const result = await AccountsRepository.getBalance(accountID);

      expect(prisma.bank_Accounts.findUnique).toHaveBeenCalledWith({
        where: { id: accountID },
      });
      expect(result).toBe(mockAccount.balance);
    });

    test('should return null if account balance is null', async () => {
      const accountID = 2;
      const mockAccountWithNullBalance = {
        id: accountID,
        balance: null,
      };
      prisma.bank_Accounts.findUnique.mockResolvedValueOnce(
        mockAccountWithNullBalance,
      );

      const result = await AccountsRepository.getBalance(accountID);

      expect(prisma.bank_Accounts.findUnique).toHaveBeenCalledWith({
        where: { id: accountID },
      });
      expect(result).toBeNull();
    });
  });

  describe('get accounts', () => {
    test('should return a list of accounts with associated users and profiles based on pagination', async () => {
      prisma.bank_Accounts.findMany.mockResolvedValueOnce(mockAccounts);

      const result = await AccountsRepository.getAccounts(pagination);

      expect(prisma.bank_Accounts.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual(mockAccounts);
    });
  });

  describe('countAccounts', () => {
    test('should return the total number of accounts', async () => {
      const mockTotalAccounts = 42;
      prisma.bank_Accounts.count.mockResolvedValueOnce(mockTotalAccounts);

      const result = await AccountsRepository.countAccounts();

      expect(prisma.bank_Accounts.count).toHaveBeenCalled();
      expect(result).toBe(mockTotalAccounts);
    });
  });

  describe('register', () => {
    test('should create a new bank account for the logged-in user', async () => {
      const userLoggedIn = { id: 1 };
      const data = {
        bank_name: 'Bank A',
        bank_account_number: '1234567890',
        balance: 1000.0,
      };

      const mockUser = { id: 1, name: 'John Doe' };
      const mockBankAccount = {
        id: 1,
        user_id: mockUser.id,
        bank_name: data.bank_name,
        bank_account_number: data.bank_account_number,
        balance: data.balance,
      };

      prisma.$transaction.mockImplementation(async (callback) => {
        return await callback({
          users: {
            findUnique: jest.fn().mockResolvedValue(mockUser),
          },
          bank_Accounts: {
            create: jest.fn().mockResolvedValue(mockBankAccount),
          },
        });
      });

      // Act: call the register function
      const result = await AccountsRepository.register(data, userLoggedIn);

      // Assert: verify that the account was created with the correct data
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(mockBankAccount);
    });
  });

  describe('get account by ID', () => {
    test('should return the account with the specified accountID', async () => {
      const accountID = 1;
      const mockAccount = {
        id: accountID,
        bank_name: 'Bank A',
        bank_account_number: '1234567890',
        balance: 1000.0,
        Users: {
          id: 1,
          name: 'John Doe',
          Profiles: {
            id: 1,
            identity_type: 'KTP',
            identity_number: '100000001',
            address: 'Address 1',
          },
        },
      };

      prisma.bank_Accounts.findUnique.mockResolvedValueOnce(mockAccount);

      const result = await AccountsRepository.getAccountById(accountID);

      expect(prisma.bank_Accounts.findUnique).toHaveBeenCalledWith({
        where: { id: accountID },
        include: {
          Users: {
            include: {
              Profiles: true,
            },
          },
        },
      });
      expect(result).toEqual(mockAccount);
    });

    test('should return null if account with given accountID does not exist', async () => {
      const accountID = 999;
      prisma.bank_Accounts.findUnique.mockResolvedValueOnce(null);

      const result = await AccountsRepository.getAccountById(accountID);

      expect(prisma.bank_Accounts.findUnique).toHaveBeenCalledWith({
        where: { id: accountID },
        include: {
          Users: {
            include: {
              Profiles: true,
            },
          },
        },
      });
      expect(result).toBeNull();
    });
  });

  describe('get account by userID', () => {
    test('should return the accounts associated with the specified userID', async () => {
      const userID = 1;
      const mockAccounts = [
        {
          id: 1,
          bank_name: 'Bank A',
          bank_account_number: '1234567890',
          balance: 1000.0,
          user_id: userID,
          Users: {
            id: userID,
            name: 'John Doe',
            Profiles: {
              id: 1,
              identity_type: 'KTP',
              identity_number: '100000001',
              address: 'Address 1',
            },
          },
        },
        {
          id: 2,
          bank_name: 'Bank B',
          bank_account_number: '0987654321',
          balance: 2000.0,
          user_id: userID,
          Users: {
            id: userID,
            name: 'John Doe',
            Profiles: {
              id: 1,
              identity_type: 'KTP',
              identity_number: '100000001',
              address: 'Address 1',
            },
          },
        },
      ];

      prisma.bank_Accounts.findMany.mockResolvedValueOnce(mockAccounts);

      const result = await AccountsRepository.getAccountByUserID(userID);

      expect(prisma.bank_Accounts.findMany).toHaveBeenCalledWith({
        where: { user_id: userID },
        include: {
          Users: {
            include: {
              Profiles: true,
            },
          },
        },
      });
      expect(result).toEqual(mockAccounts);
    });

    test('should return an empty array if no accounts are associated with the userID', async () => {
      const userID = 999;
      prisma.bank_Accounts.findMany.mockResolvedValueOnce([]);

      const result = await AccountsRepository.getAccountByUserID(userID);

      expect(prisma.bank_Accounts.findMany).toHaveBeenCalledWith({
        where: { user_id: userID },
        include: {
          Users: {
            include: {
              Profiles: true,
            },
          },
        },
      });
      expect(result).toEqual([]);
    });
  });

  describe('get account by number', () => {
    test('should return the account associated with the specified bank account number', async () => {
      const bankAccountNumber = '1234567890';
      const mockAccount = {
        id: 1,
        bank_name: 'Bank A',
        bank_account_number: bankAccountNumber,
        balance: 1000.0,
        Users: {
          id: 1,
          name: 'John Doe',
          Profiles: {
            id: 1,
            identity_type: 'KTP',
            identity_number: '100000001',
            address: 'Address 1',
          },
        },
      };

      prisma.bank_Accounts.findFirst.mockResolvedValueOnce(mockAccount);

      const result =
        await AccountsRepository.getAccountByNumber(bankAccountNumber);

      expect(prisma.bank_Accounts.findFirst).toHaveBeenCalledWith({
        where: { bank_account_number: bankAccountNumber },
        include: {
          Users: {
            include: {
              Profiles: true,
            },
          },
        },
      });
      expect(result).toEqual(mockAccount);
    });

    test('should return null if no account is associated with the specified bank account number', async () => {
      const bankAccountNumber = '9999999999';
      prisma.bank_Accounts.findFirst.mockResolvedValueOnce(null);

      const result =
        await AccountsRepository.getAccountByNumber(bankAccountNumber);

      expect(prisma.bank_Accounts.findFirst).toHaveBeenCalledWith({
        where: { bank_account_number: bankAccountNumber },
        include: {
          Users: {
            include: {
              Profiles: true,
            },
          },
        },
      });
      expect(result).toBeNull();
    });
  });

  describe('get account by number and bank name', () => {
    test('should return the account that matches the specified bank account number and bank name', async () => {
      const bankAccountNumber = '1234567890';
      const bankName = 'Bank A';
      const mockAccount = {
        id: 1,
        bank_name: bankName,
        bank_account_number: bankAccountNumber,
        balance: 1000.0,
        Users: {
          id: 1,
          name: 'John Doe',
          Profiles: {
            id: 1,
            identity_type: 'KTP',
            identity_number: '100000001',
            address: 'Address 1',
          },
        },
      };

      prisma.bank_Accounts.findFirst.mockResolvedValueOnce(mockAccount);

      const result = await AccountsRepository.getAccountByNumberAndBankName(
        bankAccountNumber,
        bankName,
      );

      expect(prisma.bank_Accounts.findFirst).toHaveBeenCalledWith({
        where: {
          AND: [
            { bank_account_number: bankAccountNumber },
            { bank_name: bankName },
          ],
        },
        include: {
          Users: {
            include: {
              Profiles: true,
            },
          },
        },
      });
      expect(result).toEqual(mockAccount);
    });

    test('should return null if no account matches the specified bank account number and bank name', async () => {
      const bankAccountNumber = '9999999999';
      const bankName = 'NonExistent Bank';
      prisma.bank_Accounts.findFirst.mockResolvedValueOnce(null);

      const result = await AccountsRepository.getAccountByNumberAndBankName(
        bankAccountNumber,
        bankName,
      );

      expect(prisma.bank_Accounts.findFirst).toHaveBeenCalledWith({
        where: {
          AND: [
            { bank_account_number: bankAccountNumber },
            { bank_name: bankName },
          ],
        },
        include: {
          Users: {
            include: {
              Profiles: true,
            },
          },
        },
      });
      expect(result).toBeNull();
    });
  });

  describe('get account by userID and accountID', () => {
    test('should return the account that matches the specified userID and accountID', async () => {
      const userID = 1;
      const accountID = 10;
      const mockAccount = {
        id: accountID,
        user_id: userID,
        bank_name: 'Bank A',
        bank_account_number: '1234567890',
        balance: 1000.0,
        Users: {
          id: userID,
          name: 'John Doe',
          Profiles: {
            id: 1,
            identity_type: 'KTP',
            identity_number: '100000001',
            address: 'Address 1',
          },
        },
      };

      prisma.bank_Accounts.findFirst.mockResolvedValueOnce(mockAccount);

      const result = await AccountsRepository.getAccountByUserIDAndAcountID(
        userID,
        accountID,
      );

      expect(prisma.bank_Accounts.findFirst).toHaveBeenCalledWith({
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
      expect(result).toEqual(mockAccount);
    });

    test('should return null if no account matches the specified userID and accountID', async () => {
      const userID = 2;
      const accountID = 20;
      prisma.bank_Accounts.findFirst.mockResolvedValueOnce(null);

      const result = await AccountsRepository.getAccountByUserIDAndAcountID(
        userID,
        accountID,
      );

      expect(prisma.bank_Accounts.findFirst).toHaveBeenCalledWith({
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
      expect(result).toBeNull();
    });
  });

  describe('delete account', () => {
    test('should delete an account and return the deleted account data', async () => {
      const accountID = 1;
      const mockDeletedAccount = {
        id: accountID,
        user_id: 1,
        bank_name: 'Bank A',
        bank_account_number: '1234567890',
        balance: 500.0,
      };

      prisma.bank_Accounts.delete.mockResolvedValueOnce(mockDeletedAccount);

      const result = await AccountsRepository.deleteAccount(accountID);

      expect(prisma.bank_Accounts.delete).toHaveBeenCalledWith({
        where: { id: accountID },
      });
      expect(result).toEqual(mockDeletedAccount);
    });

    test('should throw an error if the account does not exist', async () => {
      const accountID = 2;
      const error = new Error('Account not found');
      prisma.bank_Accounts.delete.mockRejectedValueOnce(error);

      await expect(AccountsRepository.deleteAccount(accountID)).rejects.toThrow(
        'Account not found',
      );
      expect(prisma.bank_Accounts.delete).toHaveBeenCalledWith({
        where: { id: accountID },
      });
    });
  });

  describe('update balance', () => {
    test('should update the balance of an existing account and return the updated account', async () => {
      const accountID = 1;
      const newBalance = 1500.0;
      const mockUpdatedAccount = {
        id: accountID,
        user_id: 1,
        bank_name: 'Bank A',
        bank_account_number: '1234567890',
        balance: newBalance,
        Users: {
          id: 1,
          name: 'John Doe',
          Profiles: {
            id: 1,
            identity_type: 'KTP',
            identity_number: '100000001',
            address: 'Address 1',
          },
        },
      };

      prisma.bank_Accounts.update.mockResolvedValueOnce(mockUpdatedAccount);

      const result = await AccountsRepository.updateBalance(
        accountID,
        newBalance,
      );

      expect(prisma.bank_Accounts.update).toHaveBeenCalledWith({
        where: { id: accountID },
        data: { balance: newBalance },
        include: {
          Users: {
            include: {
              Profiles: true,
            },
          },
        },
      });
      expect(result).toEqual(mockUpdatedAccount);
    });

    test('should throw an error if the account does not exist', async () => {
      const accountID = 2;
      const newBalance = 2000.0;
      const error = new Error('Account not found');
      prisma.bank_Accounts.update.mockRejectedValueOnce(error);

      await expect(
        AccountsRepository.updateBalance(accountID, newBalance),
      ).rejects.toThrow('Account not found');
      expect(prisma.bank_Accounts.update).toHaveBeenCalledWith({
        where: { id: accountID },
        data: { balance: newBalance },
        include: {
          Users: {
            include: {
              Profiles: true,
            },
          },
        },
      });
    });
  });

  describe('insufficient', () => {
    test('should return false if the account balance is sufficient for the transaction amount', async () => {
      const accountID = 1;
      const balance = 1000;
      const amount = 500;

      jest
        .spyOn(AccountsRepository, 'getBalance')
        .mockResolvedValueOnce(balance);

      const result = await AccountsRepository.insufficient(accountID, amount);

      expect(AccountsRepository.getBalance).toHaveBeenCalledWith(accountID);
      expect(result).toBe(false);
    });

    test('should return true if the account balance is insufficient for the transaction amount', async () => {
      const accountID = 2;
      const balance = 300;
      const amount = 500;

      jest
        .spyOn(AccountsRepository, 'getBalance')
        .mockResolvedValueOnce(balance);

      const result = await AccountsRepository.insufficient(accountID, amount);

      expect(AccountsRepository.getBalance).toHaveBeenCalledWith(accountID);
      expect(result).toBe(true);
    });
  });
});
