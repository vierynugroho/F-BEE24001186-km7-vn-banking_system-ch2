import express from 'express';
import { UsersController } from '../controllers/users.js';
import authentication from '../middlewares/authentication.js';
import CheckRole from '../middlewares/checkRole.js';
const router = express.Router();

router
  .route('/')
  .get(authentication, CheckRole(['ADMIN']), UsersController.getUsers);
router.route('/:userId').get(authentication, UsersController.getUserById);

export default router;
