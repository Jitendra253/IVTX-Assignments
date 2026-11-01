import * as dashboardService from '../services/dashboard.service.js';

export const getSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getDashboardSummary(req.user);
    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectProgress = async (req, res, next) => {
  try {
    const progress = await dashboardService.getProjectProgressList();
    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskDistribution = async (req, res, next) => {
  try {
    const distribution = await dashboardService.getTaskDistribution();
    res.status(200).json({
      success: true,
      data: distribution,
    });
  } catch (error) {
    next(error);
  }
};

export const getDeveloperWorkload = async (req, res, next) => {
  try {
    const workload = await dashboardService.getDeveloperWorkload();
    res.status(200).json({
      success: true,
      data: workload,
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingDeadlines = async (req, res, next) => {
  try {
    const deadlines = await dashboardService.getUpcomingDeadlines();
    res.status(200).json({
      success: true,
      data: deadlines,
    });
  } catch (error) {
    next(error);
  }
};

export const getOverdueTasks = async (req, res, next) => {
  try {
    const overdue = await dashboardService.getOverdueTaskList();
    res.status(200).json({
      success: true,
      data: overdue,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentActivity = async (req, res, next) => {
  try {
    const activity = await dashboardService.getRecentActivityFeed();
    res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};
