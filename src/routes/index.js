import express from 'express';
import bankingSystemRoute from './bankingSystem.js';
import usersRoute from './users.js';
import accountsRoute from './accounts.js';
import transactionsRoute from './transactions.js';

const router = express.Router();

router.get('/api/v1', (req, res, next) => {
  res.status(200).json({
    status: true,
    statusCode: 200,
    message: 'Welcome to API Akuuh',
  });
});

router.use('/api/v1/banking-system', bankingSystemRoute);
router.use('/api/v1/users', usersRoute);
router.use('/api/v1/accounts', accountsRoute);
router.use('/api/v1/transactions', transactionsRoute);

export default router;
