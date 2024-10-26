import { AccountsService } from '../../services/accounts.js';
import { UsersRepository } from '../../repositories/users.js';
import { AccountsRepository } from '../../repositories/accounts.js';
import { TransactionsRepository } from '../../repositories/transactions.js';
import { ErrorHandler } from '../../middlewares/error.js';

jest.mock('../../repositories/accounts.js');
jest.mock('../../repositories/users.js');
jest.mock('../../utils/formatRupiah.js');

describe('AccountsService', () => {
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
    it('should register a new account if it does not exist', async () => {
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

    it('should throw an error if the account already exists', async () => {
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

    it('should throw an error if user is not found', async () => {
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

  describe('Get Account by ID', () => {
    it('should return a list of accounts with total count', async () => {
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

    it('should return empty accounts and zero total if no accounts found', async () => {
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
});
