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
    balance: 2284.79,
    user_id: 1,
    Users: {
      id: 1,
      name: 'User 2',
      email: 'user2@example.com',
      role: 'CUSTOMER',
      password: 'password',
      Profiles: {
        id: 1,
        identity_type: 'KTP',
        identity_number: '100000001',
        address: 'Address 2',
        user_id: 1,
      },
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Register', () => {
    it('should register a new account if it does not exist', async () => {
      AccountsRepository.getAccountByNumberAndBankName.mockResolvedValue(null);
      UsersRepository.getUserById.mockResolvedValue(mockUserLoggedIn);
      AccountsRepository.register.mockResolvedValue({ id: 1, balance: 0 });

      const result = await AccountsService.register(
        mockRequest,
        mockUserLoggedIn,
      );

      expect(result).toEqual({ id: 1, balance: 0 });
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
});
