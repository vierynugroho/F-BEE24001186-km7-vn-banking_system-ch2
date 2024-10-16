import express from 'express';
const router = express.Router();
import bankingSystemRoute from './bankingSystem.js';

router.get('/api/v1', (req, res, next) => {
	res.status(200).json({
		status: true,
		statusCode: 200,
		message: 'Welcome to API Akuuh',
	});
});

router.use('/api/v1/banking-system', bankingSystemRoute);

export default router;
