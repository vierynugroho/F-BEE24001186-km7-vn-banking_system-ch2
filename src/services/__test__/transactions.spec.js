import { AccountsRepository } from '../../repositories/accounts.js';
import { TransactionsService } from '../transactions.js';

jest.mock('../../repositories/accounts.js');

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

  const transferData = {
    senderID: mockAccountsData[0].id,
    receiverID: mockAccountsData[1].id,
    amount: 100,
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
});
