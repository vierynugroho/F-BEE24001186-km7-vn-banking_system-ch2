import express from 'express';
// import bankingSystemRoute from './bankingSystem.js';
import authRoute from './auth.js';
import usersRoute from './users.js';
import accountsRoute from './accounts.js';
import transactionsRoute from './transactions.js';
import * as swaggerUI from 'swagger-ui-express';
import swaggerDoc from '../../public/docs/swagger.json' with { type: 'json' };

const router = express.Router();

router.get('/api/v1', (req, res) => {
  res.status(200).json({
    status: true,
    statusCode: 200,
    message: 'Welcome to API Akuuh',
  });
});

// router.use('/api/v1/banking-system', bankingSystemRoute);
router.use(
  '/api/v1/docs',
  swaggerUI.serve,
  swaggerUI.setup(swaggerDoc, {
    customCssUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
    ],
  }),
);
router.use('/api/v1/auth', authRoute);
router.use('/api/v1/users', usersRoute);
router.use('/api/v1/accounts', accountsRoute);
router.use('/api/v1/transactions', transactionsRoute);

export default router;
