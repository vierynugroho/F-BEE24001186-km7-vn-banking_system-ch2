import express from 'express';
import { UsersController } from '../controllers/users.js';
const router = express.Router();

router.route('/').get(UsersController.getUsers);
router.route('/:userId').get(UsersController.getUserById);

export default router;
