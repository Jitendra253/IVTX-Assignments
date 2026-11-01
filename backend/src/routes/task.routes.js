import express from 'express';
import * as taskController from '../controllers/task.controller.js';
import { requireAuth, requireRole, canModifyTask } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  updateTaskProgressSchema,
  createCommentSchema,
} from '../schemas/task.schema.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', taskController.getTasks);
router.post('/', requireRole('Admin'), validate(createTaskSchema), taskController.createTask);
router.get('/:id', taskController.getTaskById);

// Task updates protected by resource-level check: Admin or assigned Developer
router.patch('/:id', canModifyTask, validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', requireRole('Admin'), taskController.deleteTask);

router.patch('/:id/status', canModifyTask, validate(updateTaskStatusSchema), taskController.updateTaskStatus);
router.patch('/:id/progress', canModifyTask, validate(updateTaskProgressSchema), taskController.updateTaskProgress);

router.get('/:id/comments', taskController.getTaskComments);
router.post('/:id/comments', validate(createCommentSchema), taskController.addTaskComment);

router.get('/:id/activity', taskController.getTaskActivity);

export default router;
