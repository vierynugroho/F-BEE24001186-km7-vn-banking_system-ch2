import express from 'express';
import { UsersController } from '../controllers/users.js';
import authentication from '../middlewares/authentication.js';
import CheckRole from '../middlewares/checkRole.js';
import fileHandlerMiddleware from '../libs/multer.js';
import Validator from '../utils/validator.js';
import { profileUpdateSchema } from '../utils/validationSchema.js';
const router = express.Router();

router
  .route('/')
  .get(authentication, CheckRole(['ADMIN']), UsersController.getUsers)
  .patch(
    authentication,
    fileHandlerMiddleware,
    Validator(profileUpdateSchema),
    UsersController.updateProfile,
  )
  .delete(authentication, UsersController.deleteProfileData);

router.route('/:userId').get(authentication, UsersController.getUserById);

export default router;
