import { ErrorHandler } from '../../middlewares/error';
import { AccountsService } from '../../services/accounts';
import { TransactionsService } from '../../services/transactions';
import { TransactionsController } from '../transactions';

jest.mock('../../services/accounts.js');
jest.mock('../../services/transactions.js');

describe('Transactions Controller', () => {
  let res, req, next;

  req = {
    body: {},
    user: {},
    query: {},
    params: {},
  };
  res = {
    json: jest.fn(),
  };
  next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('transfer', () => {
    test('should successfully transfer funds if user has access to the account', async () => {
      req.user = { id: 1 };
      req.body = { senderID: 1, amount: 100 };
      const account = { user_id: 1 };
      const transferResponse = { id: 1, status: 'success' };

      AccountsService.getAccountById.mockResolvedValue(account);
      TransactionsService.transfer.mockResolvedValue(transferResponse);

      await TransactionsController.transfer(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        meta: {
          statusCode: 200,
          message: 'transfer transaction successfully',
        },
        data: transferResponse,
      });
    });

    test('should throw a 403 error if the user does not have access to the account', async () => {
      req.user = { id: 2 };
      req.body = { senderID: 1, amount: 100 };
      const account = { user_id: 1 };

      AccountsService.getAccountById.mockResolvedValue(account);

      await TransactionsController.transfer(req, res, next);

      expect(next).toHaveBeenCalledWith(
        new ErrorHandler(403, `you doesn't have an access for this account`),
      );
    });

    test('should handle errors thrown during account retrieval', async () => {
      req.user = { id: 1 };
      req.body = { senderID: 1, amount: 100 };

      AccountsService.getAccountById.mockRejectedValue(
        new Error('Account retrieval error'),
      );

      await TransactionsController.transfer(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    test('should handle errors thrown during the transfer', async () => {
      req.user = { id: 1 };
      req.body = { senderID: 1, amount: 100 };
      const account = { user_id: 1 };

      AccountsService.getAccountById.mockResolvedValue(account);
      TransactionsService.transfer.mockRejectedValue(
        new Error('Transfer error'),
      );

      await TransactionsController.transfer(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('get all transactions data', () => {
    test('should parse page and limit to integers and use defaults if not provided', async () => {
      const transactions = [{ id: 1, amount: 100 }];
      const totalTransactions = 1;

      TransactionsService.getAllTransactions.mockResolvedValue({
        transactions,
        totalTransactions,
      });

      req.query.page = undefined;
      req.query.limit = undefined;

      await TransactionsController.getAllTransactions(req, res, next);

      expect(TransactionsService.getAllTransactions).toHaveBeenCalledWith({
        offset: 0,
        limit: 5,
      });
      expect(res.json).toHaveBeenCalledWith({
        meta: {
          statusCode: 200,
          message: 'transations data retrieved successfully',
          pagination: {
            totalPage: 1,
            currentPage: 1,
            pageItems: transactions.length,
            nextPage: null,
            prevPage: null,
          },
        },
        data: transactions,
      });
    });

    test('should handle pagination correctly with multiple pages', async () => {
      const transactions = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        amount: (i + 1) * 100,
      }));
      const totalTransactions = 15;

      TransactionsService.getAllTransactions.mockResolvedValue({
        transactions,
        totalTransactions,
      });
      req.query.page = '2';
      req.query.limit = '5';

      await TransactionsController.getAllTransactions(req, res, next);

      expect(parseInt(req.query.page)).toBe(2);
      expect(parseInt(req.query.limit)).toBe(5);
      expect(res.json).toHaveBeenCalledWith({
        meta: {
          statusCode: 200,
          message: 'transations data retrieved successfully',
          pagination: {
            totalPage: 3,
            currentPage: 2,
            pageItems: transactions.length,
            nextPage: 3,
            prevPage: 1,
          },
        },
        data: transactions,
      });
    });

    test('should set nextPage and prevPage correctly when on the last page', async () => {
      const transactions = [{ id: 6, amount: 600 }];
      const totalTransactions = 6;

      TransactionsService.getAllTransactions.mockResolvedValue({
        transactions,
        totalTransactions,
      });
      req.query.page = '2';
      req.query.limit = '5';

      await TransactionsController.getAllTransactions(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        meta: {
          statusCode: 200,
          message: 'transations data retrieved successfully',
          pagination: {
            totalPage: 2,
            currentPage: 2,
            pageItems: transactions.length,
            nextPage: null,
            prevPage: 1,
          },
        },
        data: transactions,
      });
    });

    test('should handle service error correctly and pass it to next middleware', async () => {
      const errorMessage = 'Error retrieving transactions';
      TransactionsService.getAllTransactions.mockRejectedValue(
        new Error(errorMessage),
      );
      req.query.page = '1';
      req.query.limit = '5';

      await TransactionsController.getAllTransactions(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe(errorMessage);
    });
  });

  describe('get transaction data by transactionID', () => {
    test('should throw error if transactionID is not a number', async () => {
      req.params.transactionID = 'invalidID';
      req.user = { id: 1, role: 'CUSTOMER' };

      await TransactionsController.getTransaction(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ErrorHandler));
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(next.mock.calls[0][0].message).toBe(
        'transactionID must be a number',
      );
    });

    test('should retrieve transaction data successfully for non-customer roles', async () => {
      const transactionID = 1;
      const transaction = {
        id: transactionID,
        source_account_id: 1,
        destination_account_id: 2,
      };

      req.params.transactionID = transactionID.toString();
      req.user = { id: 1, role: 'ADMIN' };

      TransactionsService.getTransaction.mockResolvedValue(transaction);
      AccountsService.getAccountByUserID.mockResolvedValue([{ id: 1 }]);

      await TransactionsController.getTransaction(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        meta: {
          statusCode: 200,
          message: 'transaction data retrieved successfully',
        },
        data: transaction,
      });
    });

    test('should allow access if customer account matches source or destination account ID', async () => {
      const transactionID = 1;
      const transaction = {
        id: transactionID,
        source_account_id: 1,
        destination_account_id: 2,
      };

      req.params.transactionID = transactionID.toString();
      req.user = { id: 1, role: 'CUSTOMER' };

      TransactionsService.getTransaction.mockResolvedValue(transaction);
      AccountsService.getAccountByUserID.mockResolvedValue([{ id: 1 }]);

      await TransactionsController.getTransaction(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        meta: {
          statusCode: 200,
          message: 'transaction data retrieved successfully',
        },
        data: transaction,
      });
    });

    test('should deny access if customer account does not match source or destination account ID', async () => {
      const transactionID = 1;
      const transaction = {
        id: transactionID,
        source_account_id: 3,
        destination_account_id: 4,
      };

      req.params.transactionID = transactionID.toString();
      req.user = { id: 1, role: 'CUSTOMER' };

      TransactionsService.getTransaction.mockResolvedValue(transaction);
      AccountsService.getAccountByUserID.mockResolvedValue([{ id: 1 }]);

      await TransactionsController.getTransaction(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ErrorHandler));
      expect(next.mock.calls[0][0].statusCode).toBe(403);
      expect(next.mock.calls[0][0].message).toBe(
        `you doesn't have an access for this data`,
      );
    });

    test('should handle error if AccountsService throws an error', async () => {
      req.params.transactionID = '1';
      req.user = { id: 1, role: 'CUSTOMER' };
      const errorMessage = 'Error retrieving account data';

      AccountsService.getAccountByUserID.mockRejectedValue(
        new Error(errorMessage),
      );

      await TransactionsController.getTransaction(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe(errorMessage);
    });

    test('should handle error if TransactionsService throws an error', async () => {
      const transactionID = 1;
      const errorMessage = 'Error retrieving transaction data';

      req.params.transactionID = transactionID.toString();
      req.user = { id: 1, role: 'CUSTOMER' };

      TransactionsService.getTransaction.mockRejectedValue(
        new Error(errorMessage),
      );
      AccountsService.getAccountByUserID.mockResolvedValue([{ id: 1 }]);

      await TransactionsController.getTransaction(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe(errorMessage);
    });
  });
});
