import express from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/summary', dashboardController.getSummary);
router.get('/project-progress', dashboardController.getProjectProgress);
router.get('/task-distribution', dashboardController.getTaskDistribution);
router.get('/developer-workload', dashboardController.getDeveloperWorkload);
router.get('/upcoming-deadlines', dashboardController.getUpcomingDeadlines);
router.get('/overdue-tasks', dashboardController.getOverdueTasks);
router.get('/recent-activity', dashboardController.getRecentActivity);

export default router;
