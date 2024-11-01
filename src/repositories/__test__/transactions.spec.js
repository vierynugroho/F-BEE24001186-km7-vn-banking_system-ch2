import { prisma } from '../../libs/prisma.js';
import { TransactionsRepository } from '../transactions.js';

jest.mock('../../libs/prisma.js', () => ({
  prisma: {
    transactions: {
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

describe('Transactions Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('add to transaction', () => {
    test('should create a new transaction and return the transaction data', async () => {
      const senderID = 1;
      const receiverID = 2;
      const amount = 500;
      const mockTransaction = {
        id: 1,
        source_account_id: senderID,
        destination_account_id: receiverID,
        amount,
      };

      prisma.transactions.create.mockResolvedValueOnce(mockTransaction);

      const result = await TransactionsRepository.addToTransaction(
        senderID,
        receiverID,
        amount,
      );

      expect(prisma.transactions.create).toHaveBeenCalledWith({
        data: {
          source_account_id: senderID,
          destination_account_id: receiverID,
          amount,
        },
      });
      expect(result).toEqual(mockTransaction);
    });

    test('should throw an error if the transaction cannot be created', async () => {
      const senderID = 1;
      const receiverID = 2;
      const amount = 500;
      const error = new Error('Transaction failed');

      prisma.transactions.create.mockRejectedValueOnce(error);

      await expect(
        TransactionsRepository.addToTransaction(senderID, receiverID, amount),
      ).rejects.toThrow('Transaction failed');
      expect(prisma.transactions.create).toHaveBeenCalledWith({
        data: {
          source_account_id: senderID,
          destination_account_id: receiverID,
          amount,
        },
      });
    });
  });

  describe('get transactions', () => {
    test('should return a list of transactions with pagination', async () => {
      const pagination = { offset: 0, limit: 10 };
      const mockTransactions = [
        {
          id: 1,
          source_account_id: 1,
          destination_account_id: 2,
          amount: 100,
          SourceBankAccounts: {
            Users: {
              Profiles: {
                id: 1,
                identity_type: 'KTP',
                identity_number: '100000001',
                address: 'Address 1',
              },
            },
          },
          DestinationBankAccounts: {
            Users: {
              Profiles: {
                id: 2,
                identity_type: 'GIRO',
                identity_number: '100000002',
                address: 'Address 2',
              },
            },
          },
        },
      ];

      prisma.transactions.findMany.mockResolvedValueOnce(mockTransactions);

      const result = await TransactionsRepository.getTransactions(pagination);

      expect(prisma.transactions.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual(mockTransactions);
    });

    test('should return an empty list if no transactions are found', async () => {
      const pagination = { offset: 0, limit: 10 };
      const mockTransactions = [];

      prisma.transactions.findMany.mockResolvedValueOnce(mockTransactions);

      const result = await TransactionsRepository.getTransactions(pagination);

      expect(prisma.transactions.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual(mockTransactions);
    });
  });

  describe('get transaction by ID', () => {
    test('should return a transaction with related data when transaction is found', async () => {
      const transactionID = 1;
      const mockTransaction = {
        id: transactionID,
        source_account_id: 1,
        destination_account_id: 2,
        amount: 100,
        SourceBankAccounts: {
          Users: {
            Profiles: {
              id: 1,
              identity_type: 'KTP',
              identity_number: '100000001',
              address: 'Address 1',
            },
          },
        },
        DestinationBankAccounts: {
          Users: {
            Profiles: {
              id: 2,
              identity_type: 'GIRO',
              identity_number: '100000002',
              address: 'Address 2',
            },
          },
        },
      };

      prisma.transactions.findUnique.mockResolvedValueOnce(mockTransaction);

      const result = await TransactionsRepository.getTransaction(transactionID);

      expect(prisma.transactions.findUnique).toHaveBeenCalledWith({
        where: { id: transactionID },
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
      expect(result).toEqual(mockTransaction);
    });

    test('should return null if no transaction is found with the given ID', async () => {
      const transactionID = 999;
      prisma.transactions.findUnique.mockResolvedValueOnce(null);

      const result = await TransactionsRepository.getTransaction(transactionID);

      expect(prisma.transactions.findUnique).toHaveBeenCalledWith({
        where: { id: transactionID },
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
      expect(result).toBeNull();
    });
  });

  describe('get an account that has transactions', () => {
    test('should return true if transactions are found for the given accountID', async () => {
      const accountID = 1;
      const mockTransactions = [
        {
          id: 1,
          source_account_id: accountID,
          destination_account_id: 2,
          amount: 100,
        },
        {
          id: 2,
          source_account_id: 3,
          destination_account_id: accountID,
          amount: 200,
        },
      ];

      prisma.transactions.findMany.mockResolvedValueOnce(mockTransactions);

      const result = await TransactionsRepository.accountTransaction(accountID);

      expect(prisma.transactions.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { source_account_id: accountID },
            { destination_account_id: accountID },
          ],
        },
      });
      expect(result).toBe(true);
    });

    test('should return false if no transactions are found for the given accountID', async () => {
      const accountID = 1;

      prisma.transactions.findMany.mockResolvedValueOnce([]);

      const result = await TransactionsRepository.accountTransaction(accountID);

      expect(prisma.transactions.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { source_account_id: accountID },
            { destination_account_id: accountID },
          ],
        },
      });
      expect(result).toBe(false);
    });
  });

  describe('count transactions', () => {
    test('should return the total number of transactions', async () => {
      const mockTotalTransactions = 42;
      prisma.transactions.count.mockResolvedValueOnce(mockTotalTransactions);

      const result = await TransactionsRepository.countTransactions();

      expect(prisma.transactions.count).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockTotalTransactions);
    });

    test('should handle the case where there are no transactions', async () => {
      prisma.transactions.count.mockResolvedValueOnce(0);

      const result = await TransactionsRepository.countTransactions();

      expect(prisma.transactions.count).toHaveBeenCalledTimes(1);
      expect(result).toBe(0);
    });
  });
});
