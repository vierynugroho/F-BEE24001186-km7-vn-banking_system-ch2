import { AccountsService } from '../../services/accounts.js';
import { UsersRepository } from '../../repositories/users.js';
import { AccountsRepository } from '../../repositories/accounts.js';
import { TransactionsRepository } from '../../repositories/transactions.js';
import { ErrorHandler } from '../../middlewares/error.js';
import { formatRupiah } from '../../utils/formatRupiah.js';

jest.mock('../../repositories/accounts.js');
jest.mock('../../repositories/transactions.js');
jest.mock('../../repositories/users.js');
jest.mock('../../utils/formatRupiah.js');

describe('Account Services', () => {
  const mockUserLoggedIn = {
    id: 1,
    name: 'Admin',
    email: 'admin@example.com',
    role: 'ADMIN',
    password: 'password',
    Profiles: {
      id: 1,
      identity_type: 'KTM',
      identity_number: '100000000',
      address: 'Address 1',
      user_id: 1,
    },
  };

  const mockRequest = {
    bank_name: 'BRI',
    bank_account_number: '300000001',
    balance: '10000',
  };

  const mockAccountData = {
    id: 2,
    bank_name: 'BRI',
    bank_account_number: '300000001',
    balance: 1000,
    user_id: 1,
    Users: {
      id: 1,
      name: 'User',
      email: 'user@example.com',
      role: 'CUSTOMER',
      password: 'password',
      Profiles: {
        id: 1,
        identity_type: 'KTP',
        identity_number: '100000001',
        address: 'INDONESIA',
        user_id: 1,
      },
    },
  };

  const mockAccountsData = [
    {
      id: 1,
      bank_name: 'BRI',
      bank_account_number: '300000001',
      balance: 1000,
      user_id: 1,
      Users: {
        id: 1,
        name: 'account 1',
        email: 'account1@example.com',
        role: 'CUSTOMER',
        password: 'password',
        Profiles: {
          id: 1,
          identity_type: 'KTP',
          identity_number: '100000001',
          address: 'INDONESIA',
          user_id: 1,
        },
      },
    },
    {
      id: 2,
      bank_name: 'BRI',
      bank_account_number: '300000002',
      balance: 2000,
      user_id: 2,
      Users: {
        id: 2,
        name: 'account 2',
        email: 'account2@example.com',
        role: 'CUSTOMER',
        password: 'password',
        Profiles: {
          id: 2,
          identity_type: 'KTP',
          identity_number: '100000002',
          address: 'INDONESIA',
          user_id: 2,
        },
      },
    },
  ];

  const mockPagination = {
    page: 1,
    limit: 10,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Register', () => {
    test('should register a new account if it does not exist', async () => {
      AccountsRepository.getAccountByNumberAndBankName.mockResolvedValue(null);
      UsersRepository.getUserById.mockResolvedValue(mockUserLoggedIn);
      AccountsRepository.register.mockResolvedValue(mockAccountData);

      const result = await AccountsService.register(
        mockRequest,
        mockUserLoggedIn,
      );

      expect(result).toEqual(mockAccountData);
      expect(
        AccountsRepository.getAccountByNumberAndBankName,
      ).toHaveBeenCalledWith(
        mockRequest.bank_account_number,
        mockRequest.bank_name,
      );
      expect(UsersRepository.getUserById).toHaveBeenCalledWith(
        mockUserLoggedIn.id,
      );
      expect(AccountsRepository.register).toHaveBeenCalledWith(
        mockRequest,
        mockUserLoggedIn,
      );
    });

    test('should throw an error if the account already exists', async () => {
      const existingAccount = { Users: { password: 'hashed_password' } };

      AccountsRepository.getAccountByNumberAndBankName.mockResolvedValue(
        existingAccount,
      );

      await expect(
        AccountsService.register(mockRequest, mockUserLoggedIn),
      ).rejects.toThrow(
        new ErrorHandler(409, 'Account has already registered'),
      );
    });

    test('should throw an error if user is not found', async () => {
      AccountsRepository.getAccountByNumberAndBankName.mockResolvedValue(null);
      UsersRepository.getUserById.mockResolvedValue(null);

      await expect(
        AccountsService.register(mockRequest, mockUserLoggedIn),
      ).rejects.toThrow(
        new ErrorHandler(
          404,
          `Users with id ${mockUserLoggedIn.id} is not found`,
        ),
      );
    });
  });

  describe('Get Accounts', () => {
    test('should return a list of accounts with total count', async () => {
      const totalAccounts = mockAccountsData.length;

      AccountsRepository.getAccounts.mockResolvedValue(mockAccountsData);
      AccountsRepository.countAccounts.mockResolvedValue(totalAccounts);

      const result = await AccountsService.getAccounts(mockPagination);

      expect(result).toEqual({
        accounts: mockAccountsData,
        totalAccounts: mockAccountsData.length,
      });

      expect(AccountsRepository.getAccounts).toHaveBeenCalledWith(
        mockPagination,
      );
      expect(AccountsRepository.countAccounts).toHaveBeenCalled();
    });

    test('should return empty accounts and zero total if no accounts found', async () => {
      // Set up mocks for no accounts
      AccountsRepository.getAccounts.mockResolvedValue([]);
      AccountsRepository.countAccounts.mockResolvedValue(0);

      const result = await AccountsService.getAccounts(mockPagination);

      expect(result).toEqual({
        accounts: [],
        totalAccounts: 0,
      });

      expect(AccountsRepository.getAccounts).toHaveBeenCalledWith(
        mockPagination,
      );
      expect(AccountsRepository.countAccounts).toHaveBeenCalled();
    });
  });

  describe('Get Account By ID', () => {
    test('should return account data if account exists', async () => {
      const accountID = 1;

      AccountsRepository.getAccountById.mockResolvedValue(mockAccountData);

      const result = await AccountsService.getAccountById(accountID);

      expect(result).toEqual(mockAccountData);
      expect(AccountsRepository.getAccountById).toHaveBeenCalledWith(accountID);
    });

    test('should throw an error if account does not exist', async () => {
      const accountID = 999;

      AccountsRepository.getAccountById.mockResolvedValue(null);

      await expect(AccountsService.getAccountById(accountID)).rejects.toThrow(
        new ErrorHandler(404, `account with id ${accountID} is not found`),
      );

      expect(AccountsRepository.getAccountById).toHaveBeenCalledWith(accountID);
    });
  });

  describe('Get Account By userID', () => {
    test('should return a list of accounts for a given user ID', async () => {
      const userID = 1;

      AccountsRepository.getAccountByUserID.mockResolvedValue(mockAccountsData);

      const result = await AccountsService.getAccountByUserID(userID);

      expect(result).toEqual(mockAccountsData);

      expect(AccountsRepository.getAccountByUserID).toHaveBeenCalledWith(
        userID,
      );
    });

    test('should throw an error if no accounts are found for the given user ID', async () => {
      const userID = 999;

      AccountsRepository.getAccountByUserID.mockResolvedValue(null);

      await expect(AccountsService.getAccountByUserID(userID)).rejects.toThrow(
        new ErrorHandler(
          404,
          `there is no account owned by user with id ${userID}`,
        ),
      );

      expect(AccountsRepository.getAccountByUserID).toHaveBeenCalledWith(
        userID,
      );
    });
  });

  describe('Delete Account', () => {
    test('should delete an account if all conditions are met', async () => {
      const userID = 1;
      const accountID = 1;

      AccountsRepository.getAccountById.mockResolvedValue({ id: accountID });
      AccountsRepository.getAccountByUserIDAndAcountID.mockResolvedValue({
        id: accountID,
      });
      TransactionsRepository.accountTransaction.mockResolvedValue(false);
      AccountsRepository.deleteAccount.mockResolvedValue({
        id: accountID,
        deleted: true,
      });

      const result = await AccountsService.deleteAccount(userID, accountID);

      expect(result).toEqual({ id: accountID, deleted: true });
      expect(AccountsRepository.getAccountById).toHaveBeenCalledWith(accountID);
      expect(
        AccountsRepository.getAccountByUserIDAndAcountID,
      ).toHaveBeenCalledWith(userID, accountID);
      expect(TransactionsRepository.accountTransaction).toHaveBeenCalledWith(
        accountID,
      );
      expect(AccountsRepository.deleteAccount).toHaveBeenCalledWith(accountID);
    });

    test('should throw a 404 error if the account is not found', async () => {
      const userID = 2;
      const accountID = 999;

      AccountsRepository.getAccountById.mockResolvedValue(null);

      await expect(
        AccountsService.deleteAccount(userID, accountID),
      ).rejects.toThrow(
        new ErrorHandler(404, `account with id ${accountID} is not found`),
      );

      expect(AccountsRepository.getAccountById).toHaveBeenCalledWith(accountID);
    });

    test('should throw a 403 error if the user does not have access to the account', async () => {
      const userID = 1;
      const accountID = 1;

      AccountsRepository.getAccountById.mockResolvedValue({ id: accountID });
      AccountsRepository.getAccountByUserIDAndAcountID.mockResolvedValue(null);

      await expect(
        AccountsService.deleteAccount(userID, accountID),
      ).rejects.toThrow(
        new ErrorHandler(
          403,
          `you doesn't have an access for account with id ${accountID}`,
        ),
      );

      expect(
        AccountsRepository.getAccountByUserIDAndAcountID,
      ).toHaveBeenCalledWith(userID, accountID);
    });

    test('should throw a 403 error if account has transaction data', async () => {
      const userID = 1;
      const accountID = 1;

      // Mock account found with transactions
      AccountsRepository.getAccountById.mockResolvedValue({ id: accountID });
      AccountsRepository.getAccountByUserIDAndAcountID.mockResolvedValue({
        id: accountID,
      });
      TransactionsRepository.accountTransaction.mockResolvedValue(true);

      await expect(
        AccountsService.deleteAccount(userID, accountID),
      ).rejects.toThrow(
        new ErrorHandler(
          403,
          `account has transaction data, account cannot be deleted`,
        ),
      );

      expect(TransactionsRepository.accountTransaction).toHaveBeenCalledWith(
        accountID,
      );
    });
  });

  describe('Deposit', () => {
    test('should deposit the amount and return updated balance with formatted amount', async () => {
      const accountID = 1;
      const amount = 100000;
      const newBalance = 101000;
      const formattedAmount = 'Rp100.000';
      const updatedAccountData = {
        balance: newBalance,
        ...mockAccountData,
      };

      AccountsRepository.getAccountById.mockResolvedValue(mockAccountData);
      AccountsRepository.updateBalance.mockResolvedValue(updatedAccountData);
      TransactionsRepository.addToTransaction.mockResolvedValue(true);
      formatRupiah.mockResolvedValue(formattedAmount);

      const result = await AccountsService.deposit(accountID, amount);

      expect(result).toEqual({
        amount: formattedAmount,
        currentAccountBalance: updatedAccountData,
      });

      expect(AccountsRepository.getAccountById).toHaveBeenCalledWith(accountID);
      expect(AccountsRepository.updateBalance).toHaveBeenCalledWith(
        accountID,
        newBalance,
      );
      expect(TransactionsRepository.addToTransaction).toHaveBeenCalledWith(
        accountID,
        accountID,
        amount,
      );
      expect(formatRupiah).toHaveBeenCalledWith(amount);
    });

    test('should throw a 404 error if account is not found', async () => {
      const accountID = 999;
      const amount = 100000;

      AccountsRepository.getAccountById.mockResolvedValue(null);

      await expect(AccountsService.deposit(accountID, amount)).rejects.toThrow(
        new ErrorHandler(404, `account with ID: ${accountID} is not found`),
      );

      expect(AccountsRepository.getAccountById).toHaveBeenCalledWith(accountID);
    });
  });

  describe('Withdrawal', () => {
    test('should withdraw the amount and return updated balance with formatted amount', async () => {
      const accountID = 1;
      const amount = 100;

      const newBalance = 900;
      const formattedAmount = 'Rp900';
      const updatedAccountData = {
        balance: newBalance,
        ...mockAccountData,
      };

      AccountsRepository.getAccountById.mockResolvedValue(mockAccountData);
      AccountsRepository.insufficient.mockResolvedValue(false);
      AccountsRepository.updateBalance.mockResolvedValue(updatedAccountData);
      TransactionsRepository.addToTransaction.mockResolvedValue(true);
      formatRupiah.mockResolvedValue(formattedAmount);

      const result = await AccountsService.withdrawal(accountID, amount);

      expect(result).toEqual({
        amount: formattedAmount,
        currentAccountBalance: updatedAccountData,
      });

      expect(AccountsRepository.getAccountById).toHaveBeenCalledWith(accountID);
      expect(AccountsRepository.insufficient).toHaveBeenCalledWith(
        accountID,
        amount,
      );
      expect(AccountsRepository.updateBalance).toHaveBeenCalledWith(
        accountID,
        newBalance,
      );
      expect(TransactionsRepository.addToTransaction).toHaveBeenCalledWith(
        accountID,
        accountID,
        amount,
      );
      expect(formatRupiah).toHaveBeenCalledWith(amount);
    });

    test('should throw a 404 error if account is not found', async () => {
      const accountID = 999;
      const amount = 100000;

      AccountsRepository.getAccountById.mockResolvedValue(null);

      await expect(
        AccountsService.withdrawal(accountID, amount),
      ).rejects.toThrow(
        new ErrorHandler(404, `account with ID: ${accountID} is not found`),
      );

      expect(AccountsRepository.getAccountById).toHaveBeenCalledWith(accountID);
    });

    test('should throw a 400 error if account balance is insufficient', async () => {
      const accountID = 1;
      const amount = 600000;
      const accountData = { id: accountID, balance: 500000 };

      AccountsRepository.getAccountById.mockResolvedValue(accountData);
      AccountsRepository.insufficient.mockResolvedValue(true);

      await expect(
        AccountsService.withdrawal(accountID, amount),
      ).rejects.toThrow(
        new ErrorHandler(400, `account remaining balance is insufficient`),
      );

      expect(AccountsRepository.getAccountById).toHaveBeenCalledWith(accountID);
      expect(AccountsRepository.insufficient).toHaveBeenCalledWith(
        accountID,
        amount,
      );
    });
  });
});
