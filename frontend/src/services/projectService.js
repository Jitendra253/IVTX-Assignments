import api from './api.js';

export const projectService = {
  getProjects: async (params = {}) => {
    const res = await api.get('/projects', { params });
    return res.data.data;
  },
  getProjectById: async (id) => {
    const res = await api.get(`/projects/${id}`);
    return res.data.data;
  },
  createProject: async (data) => {
    const res = await api.post('/projects', data);
    return res.data.data;
  },
  updateProject: async (id, data) => {
    const res = await api.patch(`/projects/${id}`, data);
    return res.data.data;
  },
  deleteProject: async (id) => {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },
  getProjectTasks: async (id, params = {}) => {
    const res = await api.get(`/projects/${id}/tasks`, { params });
    return res.data.data;
  },
};
