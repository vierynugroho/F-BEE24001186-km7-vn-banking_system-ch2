import { AccountsRepository } from '../../repositories/accounts.js';
import { TransactionsService } from '../transactions.js';
import { TransactionsRepository } from '../../repositories/transactions.js';
import { formatRupiah } from '../../utils/formatRupiah.js';

jest.mock('../../repositories/accounts.js');
jest.mock('../../repositories/transactions.js');
jest.mock('../../repositories/users.js');
jest.mock('../../utils/formatRupiah.js');

describe('Transaction Services', () => {
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

  const pagination = { limit: 10, offset: 0 };

  const mockTransactions = [
    {
      id: 31,
      source_account_id: 7,
      destination_account_id: 6,
      amount: 799.83,
      SourceBankAccounts: {
        id: 7,
        bank_name: 'MANDIRI',
        bank_account_number: '200000006',
        balance: 4442.11,
        user_id: 4,
        Users: {
          id: 4,
          name: 'User 7',
          email: 'user7@example.com',
          role: 'CUSTOMER',
          Profiles: {
            id: 4,
            identity_type: 'SIM',
            identity_number: '100000006',
            address: 'Address 7',
            user_id: 4,
          },
        },
      },
      DestinationBankAccounts: {
        id: 6,
        bank_name: 'PERMATA',
        bank_account_number: '300000007',
        balance: 4883.74,
        user_id: 3,
        Users: {
          id: 3,
          name: 'User 8',
          email: 'user8@example.com',
          role: 'CUSTOMER',
          Profiles: {
            id: 3,
            identity_type: 'SIM',
            identity_number: '100000007',
            address: 'Address 8',
            user_id: 3,
          },
        },
      },
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    test('should return the balance', async () => {
      AccountsRepository.getBalance.mockResolvedValue(mockAccountData.balance);

      const balance = await TransactionsService.getBalance(mockAccountData.id);

      expect(balance).toBe(mockAccountData.balance);
      expect(AccountsRepository.getBalance).toHaveBeenCalledWith(
        mockAccountData.id,
      );
    });
  });

  describe('transfer', () => {
    const senderID = 1;
    const receiverID = 2;
    const amount = 100000;
    const sender = { id: senderID, balance: 200000, bank_name: 'Bank A' };
    const receiver = { id: receiverID, balance: 100000, bank_name: 'Bank B' };
    const senderInitialBalance = 200000;
    const receiverInitialBalance = 100000;
    const newSenderBalance = senderInitialBalance - amount;
    const newReceiverBalance = receiverInitialBalance + amount;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('throws an error if sender account is not found', async () => {
      AccountsRepository.getAccountById.mockResolvedValueOnce(null);

      await expect(
        TransactionsService.transfer({ senderID, receiverID, amount }),
      ).rejects.toThrow('account with ID: 1 is not found');
    });

    test('throws an error if receiver account is not found', async () => {
      AccountsRepository.getAccountById
        .mockResolvedValueOnce(sender)
        .mockResolvedValueOnce(null);

      await expect(
        TransactionsService.transfer({ senderID, receiverID, amount }),
      ).rejects.toThrow('account with ID: 2 is not found');
    });

    test('throws an error if transferring between same accounts in the same bank', async () => {
      const sameAccount = {
        id: senderID,
        balance: 200000,
        bank_name: 'Bank A',
      };
      AccountsRepository.getAccountById
        .mockResolvedValueOnce(sameAccount)
        .mockResolvedValueOnce(sameAccount);

      await expect(
        TransactionsService.transfer({
          senderID,
          receiverID: senderID,
          amount,
        }),
      ).rejects.toThrow(
        'transactions between 2 (two) same accounts are not allowed',
      );
    });

    test('throws an error if the sender has insufficient funds', async () => {
      AccountsRepository.getAccountById
        .mockResolvedValueOnce(sender)
        .mockResolvedValueOnce(receiver);
      AccountsRepository.insufficient.mockResolvedValueOnce(true);

      await expect(
        TransactionsService.transfer({ senderID, receiverID, amount }),
      ).rejects.toThrow('account remaining balance is insufficient');
    });

    test('should transfer amount between accounts successfully', async () => {
      const sender = {
        id: senderID,
        balance: senderInitialBalance,
        bank_name: 'Bank A',
      };
      const receiver = {
        id: receiverID,
        balance: receiverInitialBalance,
        bank_name: 'Bank B',
      };

      AccountsRepository.getAccountById
        .mockResolvedValueOnce(sender)
        .mockResolvedValueOnce(receiver);
      AccountsRepository.insufficient.mockResolvedValueOnce(false);
      AccountsRepository.updateBalance
        .mockResolvedValueOnce({ balance: newSenderBalance })
        .mockResolvedValueOnce({ balance: newReceiverBalance });
      TransactionsRepository.addToTransaction.mockResolvedValueOnce(true);

      formatRupiah.mockImplementation((balance) => `Rp${balance}`);

      const result = await TransactionsService.transfer({
        senderID,
        receiverID,
        amount,
      });

      expect(AccountsRepository.getAccountById).toHaveBeenCalledWith(senderID);
      expect(AccountsRepository.getAccountById).toHaveBeenCalledWith(
        receiverID,
      );
      expect(AccountsRepository.insufficient).toHaveBeenCalledWith(
        senderID,
        amount,
      );
      expect(AccountsRepository.updateBalance).toHaveBeenCalledWith(
        senderID,
        newSenderBalance,
      );
      expect(AccountsRepository.updateBalance).toHaveBeenCalledWith(
        receiverID,
        newReceiverBalance,
      );
      expect(TransactionsRepository.addToTransaction).toHaveBeenCalledWith(
        senderID,
        receiverID,
        amount,
      );

      expect(result).toEqual({
        amount,
        currentSenderBalance: `Rp${newSenderBalance}`,
        currentReceiverBalance: `Rp${newReceiverBalance}`,
      });
    });
  });

  describe('get all transactions', () => {
    test('should return transactions and total count with passwords removed', async () => {
      TransactionsRepository.getTransactions.mockResolvedValueOnce(
        mockTransactions,
      );
      TransactionsRepository.countTransactions.mockResolvedValueOnce(2);

      const result = await TransactionsService.getAllTransactions(pagination);

      expect(TransactionsRepository.getTransactions).toHaveBeenCalledWith(
        pagination,
      );
      expect(TransactionsRepository.countTransactions).toHaveBeenCalled();

      result.transactions.forEach((trx) => {
        expect(trx.SourceBankAccounts.Users.password).toBeUndefined();
        expect(trx.DestinationBankAccounts.Users.password).toBeUndefined();
      });

      expect(result).toEqual({
        transactions: [
          {
            id: 31,
            source_account_id: 7,
            destination_account_id: 6,
            amount: 799.83,
            SourceBankAccounts: {
              id: 7,
              bank_name: 'MANDIRI',
              bank_account_number: '200000006',
              balance: 4442.11,
              user_id: 4,
              Users: {
                id: 4,
                name: 'User 7',
                email: 'user7@example.com',
                role: 'CUSTOMER',
                Profiles: {
                  id: 4,
                  identity_type: 'SIM',
                  identity_number: '100000006',
                  address: 'Address 7',
                  user_id: 4,
                },
              },
            },
            DestinationBankAccounts: {
              id: 6,
              bank_name: 'PERMATA',
              bank_account_number: '300000007',
              balance: 4883.74,
              user_id: 3,
              Users: {
                id: 3,
                name: 'User 8',
                email: 'user8@example.com',
                role: 'CUSTOMER',
                Profiles: {
                  id: 3,
                  identity_type: 'SIM',
                  identity_number: '100000007',
                  address: 'Address 8',
                  user_id: 3,
                },
              },
            },
          },
        ],
        totalTransactions: 2,
      });
    });
  });

  describe('get transaction by ID', () => {
    const transactionID = 1;

    test('should return a transaction with passwords removed if found', async () => {
      TransactionsRepository.getTransaction.mockResolvedValueOnce(
        mockTransactions[0],
      );

      const result = await TransactionsService.getTransaction(transactionID);

      expect(TransactionsRepository.getTransaction).toHaveBeenCalledWith(
        transactionID,
      );
      expect(result).toEqual({
        id: 31,
        source_account_id: 7,
        destination_account_id: 6,
        amount: 799.83,
        SourceBankAccounts: {
          id: 7,
          bank_name: 'MANDIRI',
          bank_account_number: '200000006',
          balance: 4442.11,
          user_id: 4,
          Users: {
            id: 4,
            name: 'User 7',
            email: 'user7@example.com',
            role: 'CUSTOMER',
            Profiles: {
              id: 4,
              identity_type: 'SIM',
              identity_number: '100000006',
              address: 'Address 7',
              user_id: 4,
            },
          },
        },
        DestinationBankAccounts: {
          id: 6,
          bank_name: 'PERMATA',
          bank_account_number: '300000007',
          balance: 4883.74,
          user_id: 3,
          Users: {
            id: 3,
            name: 'User 8',
            email: 'user8@example.com',
            role: 'CUSTOMER',
            Profiles: {
              id: 3,
              identity_type: 'SIM',
              identity_number: '100000007',
              address: 'Address 8',
              user_id: 3,
            },
          },
        },
      });

      expect(result.SourceBankAccounts.Users.password).toBeUndefined();
      expect(result.DestinationBankAccounts.Users.password).toBeUndefined();
    });

    test('should throw an error if transaction is not found', async () => {
      TransactionsRepository.getTransaction.mockResolvedValueOnce(null);

      await expect(
        TransactionsService.getTransaction(transactionID),
      ).rejects.toThrow(`transaction with id ${transactionID} is not found`);

      expect(TransactionsRepository.getTransaction).toHaveBeenCalledWith(
        transactionID,
      );
    });
  });
});
