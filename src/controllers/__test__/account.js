import { AccountsService } from '../../services/accounts';
import { AccountsController } from '../accounts';

describe('Accounts Controller', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const mockData = {
    bank_name: 'Test',
    bank_account_number: '12345678',
    balance: 1000,
  };

  let mockRequest = {};
  let mockResponse = {
    meta: {
      statusCode: 200,
      message: 'successfully',
    },
    data: {
      data: '',
    },
  };

  describe('register', () => {
    // test
  });
  describe('get accounts', () => {
    // test
  });
  describe('get account by ID', () => {
    // test
  });
  describe('delete account', () => {
    // test
  });
  describe('deposit', () => {
    // test
  });

  describe('withdrawal', () => {
    // test
  });
});
