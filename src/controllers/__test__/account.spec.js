import { ErrorHandler } from '../../middlewares/error.js';
import { AccountsService } from '../../services/accounts.js';
import { AccountsController } from '../accounts.js';

jest.mock('../../services/accounts.js');

describe('Accounts Controller', () => {
  let res, req, next;

  const mockUser = { id: 1, name: 'Test User' };
  const mockData = {
    bank_name: 'Test Bank',
    bank_account_number: '12345678',
    balance: 1000,
  };
  const mockAccountResponse = {
    id: 1,
    user_id: mockUser.id,
    bank_name: mockData.bank_name,
    bank_account_number: mockData.bank_account_number,
    balance: mockData.balance,
  };

  beforeEach(() => {
    req = {
      body: mockData,
      user: mockUser,
      query: {},
      params: {},
    };
    res = {
      json: jest.fn(),
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register an account successfully and return account data with status 200', async () => {
      AccountsService.register.mockResolvedValueOnce(mockAccountResponse);

      await AccountsController.register(req, res, next);

      expect(AccountsService.register).toHaveBeenCalledWith(mockData, mockUser);
      expect(res.json).toHaveBeenCalledWith({
        meta: {
          statusCode: 200,
          message: 'register successfully',
        },
        data: mockAccountResponse,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with an error when registration fails', async () => {
      const error = new Error('Registration failed');
      AccountsService.register.mockRejectedValueOnce(error);

      await AccountsController.register(req, res, next);

      expect(AccountsService.register).toHaveBeenCalledWith(mockData, mockUser);
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('get accounts', () => {
    it('should successfully retrieve accounts data with pagination', async () => {
      req.query.page = '1';
      req.query.limit = '5';

      const mockAccounts = [
        { id: 1, Users: { password: 'hidden' } },
        { id: 2, Users: { password: 'hidden' } },
      ];
      const mockTotalAccounts = 10;

      AccountsService.getAccounts.mockResolvedValue({
        accounts: mockAccounts,
        totalAccounts: mockTotalAccounts,
      });

      await AccountsController.getAccounts(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        meta: {
          statusCode: 200,
          message: 'accounts data retrieved successfully',
          pagination: {
            totalPage: 2,
            currentPage: 1,
            pageItems: mockAccounts.length,
            nextPage: 2,
            prevPage: null,
          },
        },
        data: mockAccounts,
      });
    });

    it('should return nextPage as null when on the last page', async () => {
      req.query.page = '2'; // halaman terakhir
      req.query.limit = '5';

      const mockAccounts = [{ id: 6, Users: { password: 'secret' } }];
      const totalAccounts = 10;

      AccountsService.getAccounts.mockResolvedValue({
        accounts: mockAccounts,
        totalAccounts,
      });

      await AccountsController.getAccounts(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        meta: {
          statusCode: 200,
          message: 'accounts data retrieved successfully',
          pagination: {
            totalPage: 2,
            currentPage: 2,
            pageItems: 1,
            nextPage: null,
            prevPage: 1,
          },
        },
        data: [{ id: 6, Users: {} }],
      });
    });

    it('should default to page 1 and limit 5 when they are not provided', async () => {
      req.query = {};

      const mockAccounts = [{ id: 1, Users: { password: 'hidden' } }];
      const mockTotalAccounts = 6;

      AccountsService.getAccounts.mockResolvedValue({
        accounts: mockAccounts,
        totalAccounts: mockTotalAccounts,
      });

      await AccountsController.getAccounts(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          meta: expect.objectContaining({
            pagination: expect.objectContaining({
              currentPage: 1,
              totalPage: 2,
            }),
          }),
          data: mockAccounts,
        }),
      );
    });

    it('should handle service errors gracefully', async () => {
      req.query.page = '1';
      req.query.limit = '5';

      const serviceError = new Error('Service Error');
      AccountsService.getAccounts.mockRejectedValue(serviceError);

      await AccountsController.getAccounts(req, res, next);

      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('get account by ID', () => {
    it('should return account data for a valid request by ADMIN', async () => {
      req.params.accountID = '1';
      req.user = { role: 'ADMIN' };

      const mockAccount = { user_id: 1, name: 'John Doe' };

      AccountsService.getAccountById.mockResolvedValue(mockAccount);

      await AccountsController.getAccountById(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        meta: {
          statusCode: 200,
          message: 'account data retrieved successfully',
        },
        data: mockAccount,
      });
    });

    it('should return account data for a valid request by non-ADMIN user with matching user_id', async () => {
      req.params.accountID = '1';
      req.user = { role: 'USER', id: 1 };

      const mockAccount = { user_id: 1, name: 'John Doe' };

      AccountsService.getAccountById.mockResolvedValue(mockAccount);

      await AccountsController.getAccountById(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        meta: {
          statusCode: 200,
          message: 'account data retrieved successfully',
        },
        data: mockAccount,
      });
    });

    it('should throw a 403 error if a non-ADMIN user tries to access another user’s data', async () => {
      req.params.accountID = '2';
      req.user = { role: 'USER', id: 1 };

      const mockAccount = { user_id: 2, name: 'Jane Doe' };

      AccountsService.getAccountById.mockResolvedValue(mockAccount);

      await AccountsController.getAccountById(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: `you doesn't have an access for this data`,
        }),
      );
    });

    it('should throw a 400 error if accountID is not a number', async () => {
      req.params.accountID = 'invalid';
      req.user = { role: 'ADMIN' };

      await AccountsController.getAccountById(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'accountID must be a number',
        }),
      );
    });

    it('should handle service errors gracefully', async () => {
      req.params.accountID = '1';
      req.user = { role: 'ADMIN' };

      const serviceError = new Error('Service Error');
      AccountsService.getAccountById.mockRejectedValue(serviceError);

      await AccountsController.getAccountById(req, res, next);

      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('delete account', () => {
    it('should delete account data successfully', async () => {
      req.user.id = '1';
      req.params.accountID = '1';

      const mockDeleteResponse = { success: true };

      AccountsService.deleteAccount.mockResolvedValue(mockDeleteResponse);

      await AccountsController.deleteAccount(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        meta: {
          statusCode: 200,
          message: 'account data deleted successfully',
        },
        data: mockDeleteResponse,
      });
    });

    it('should throw a 400 error if userID is not a number', async () => {
      req.user.id = 'invalid';
      req.params.accountID = '1';

      await AccountsController.deleteAccount(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'userID must be a number',
        }),
      );
    });

    it('should throw a 400 error if accountID is not a number', async () => {
      req.user.id = '1';
      req.params.accountID = 'invalid';

      await AccountsController.deleteAccount(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'accountID must be a number',
        }),
      );
    });

    it('should handle service errors gracefully', async () => {
      req.user.id = '1';
      req.params.accountID = '1';

      const serviceError = new Error('Service Error');
      AccountsService.deleteAccount.mockRejectedValue(serviceError);

      await AccountsController.deleteAccount(req, res, next);

      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('deposit', () => {
    it('should successfully deposit an amount into the account', async () => {
      req.user.id = 1;
      req.params.accountID = '1';
      req.body.amount = 100;

      const mockAccount = { user_id: 1 };
      const mockDepositResponse = { success: true, balance: 1100 };

      AccountsService.getAccountById.mockResolvedValue(mockAccount);
      AccountsService.deposit.mockResolvedValue(mockDepositResponse);

      await AccountsController.deposit(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        meta: {
          statusCode: 200,
          message: 'deposit successfully',
        },
        data: mockDepositResponse,
      });
    });

    it('should throw a 400 error if accountID is not a number', async () => {
      req.params.accountID = 'invalid';
      req.user.id = 1;
      req.body.amount = 100;

      await AccountsController.deposit(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'accountID must be a number',
        }),
      );
    });

    it('should throw a 403 error if user does not own the account', async () => {
      req.user.id = 2;
      req.params.accountID = '1';
      req.body.amount = 100;

      const mockAccount = { user_id: 1 }; // Account belongs to another user

      AccountsService.getAccountById.mockResolvedValue(mockAccount);

      await AccountsController.deposit(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: `you doesn't have an access for this account`,
        }),
      );
    });

    it('should handle service errors gracefully', async () => {
      req.user.id = 1;
      req.params.accountID = '1';
      req.body.amount = 100;

      const serviceError = new Error('Service Error');
      AccountsService.getAccountById.mockRejectedValue(serviceError);

      await AccountsController.deposit(req, res, next);

      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('withdrawal', () => {
    it('should successfully withdraw an amount from the account', async () => {
      req.user.id = 1;
      req.params.accountID = '1';
      req.body.amount = 50;

      const mockAccount = { user_id: 1 };
      const mockWithdrawalResponse = { success: true, balance: 950 };

      AccountsService.getAccountById.mockResolvedValue(mockAccount);
      AccountsService.withdrawal.mockResolvedValue(mockWithdrawalResponse);

      await AccountsController.withdrawal(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        meta: {
          statusCode: 200,
          message: 'withdrawal successfully',
        },
        data: mockWithdrawalResponse,
      });
    });

    it('should throw a 400 error if accountID is not a number', async () => {
      req.params.accountID = 'invalid';
      req.user.id = 1;
      req.body.amount = 50;

      await AccountsController.withdrawal(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'accountID must be a number',
        }),
      );
    });

    it('should throw a 403 error if user does not own the account', async () => {
      req.user.id = 2;
      req.params.accountID = '1';
      req.body.amount = 50;

      const mockAccount = { user_id: 1 }; // Account belongs to another user

      AccountsService.getAccountById.mockResolvedValue(mockAccount);

      await AccountsController.withdrawal(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: `you doesn't have an access for this account`,
        }),
      );
    });

    it('should handle service errors gracefully', async () => {
      req.user.id = 1;
      req.params.accountID = '1';
      req.body.amount = 50;

      const serviceError = new Error('Service Error');
      AccountsService.getAccountById.mockRejectedValue(serviceError);

      await AccountsController.withdrawal(req, res, next);

      expect(next).toHaveBeenCalledWith(serviceError);
    });
  });
});
