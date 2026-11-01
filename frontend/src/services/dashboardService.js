import api from './api.js';

export const dashboardService = {
  getSummary: async () => {
    const res = await api.get('/dashboard/summary');
    return res.data.data;
  },
  getProjectProgress: async () => {
    const res = await api.get('/dashboard/project-progress');
    return res.data.data;
  },
  getTaskDistribution: async () => {
    const res = await api.get('/dashboard/task-distribution');
    return res.data.data;
  },
  getDeveloperWorkload: async () => {
    const res = await api.get('/dashboard/developer-workload');
    return res.data.data;
  },
  getUpcomingDeadlines: async () => {
    const res = await api.get('/dashboard/upcoming-deadlines');
    return res.data.data;
  },
  getOverdueTasks: async () => {
    const res = await api.get('/dashboard/overdue-tasks');
    return res.data.data;
  },
  getRecentActivity: async () => {
    const res = await api.get('/dashboard/recent-activity');
    return res.data.data;
  },
};
