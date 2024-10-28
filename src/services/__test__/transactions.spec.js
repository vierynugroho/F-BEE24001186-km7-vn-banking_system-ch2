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

    it('throws an error if sender account is not found', async () => {
      AccountsRepository.getAccountById.mockResolvedValueOnce(null);

      await expect(
        TransactionsService.transfer({ senderID, receiverID, amount }),
      ).rejects.toThrow('account with ID: 1 is not found');
    });

    it('throws an error if receiver account is not found', async () => {
      AccountsRepository.getAccountById
        .mockResolvedValueOnce(sender)
        .mockResolvedValueOnce(null);

      await expect(
        TransactionsService.transfer({ senderID, receiverID, amount }),
      ).rejects.toThrow('account with ID: 2 is not found');
    });

    it('throws an error if transferring between same accounts in the same bank', async () => {
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

    it('throws an error if the sender has insufficient funds', async () => {
      AccountsRepository.getAccountById
        .mockResolvedValueOnce(sender)
        .mockResolvedValueOnce(receiver);
      AccountsRepository.insufficient.mockResolvedValueOnce(true);

      await expect(
        TransactionsService.transfer({ senderID, receiverID, amount }),
      ).rejects.toThrow('account remaining balance is insufficient');
    });

    it('should transfer amount between accounts successfully', async () => {
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
});
