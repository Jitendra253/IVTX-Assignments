import express from 'express';
import * as projectController from '../controllers/project.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createProjectSchema, updateProjectSchema } from '../schemas/project.schema.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', projectController.getProjects);
router.post('/', requireRole('Admin'), validate(createProjectSchema), projectController.createProject);
router.get('/:id', projectController.getProjectById);
router.patch('/:id', requireRole('Admin'), validate(updateProjectSchema), projectController.updateProject);
router.delete('/:id', requireRole('Admin'), projectController.deleteProject);
router.get('/:id/tasks', projectController.getProjectTasks);

export default router;
