import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createUserSchema, updateUserSchema } from '../schemas/auth.schema.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', requireRole('Admin'), validate(createUserSchema), userController.createUser);
router.patch('/:id', requireRole('Admin'), validate(updateUserSchema), userController.updateUser);
router.patch('/:id/status', requireRole('Admin'), userController.updateUserStatus);

export default router;
