import api from './api.js';

export const taskService = {
  getTasks: async (params = {}) => {
    const res = await api.get('/tasks', { params });
    return res.data;
  },
  getTaskById: async (id) => {
    const res = await api.get(`/tasks/${id}`);
    return res.data.data;
  },
  createTask: async (data) => {
    const res = await api.post('/tasks', data);
    return res.data.data;
  },
  updateTask: async (id, data) => {
    const res = await api.patch(`/tasks/${id}`, data);
    return res.data.data;
  },
  updateStatus: async (id, status) => {
    const res = await api.patch(`/tasks/${id}/status`, { status });
    return res.data.data;
  },
  updateProgress: async (id, progress) => {
    const res = await api.patch(`/tasks/${id}/progress`, { progress });
    return res.data.data;
  },
  deleteTask: async (id) => {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
  },
  getComments: async (id) => {
    const res = await api.get(`/tasks/${id}/comments`);
    return res.data.data;
  },
  addComment: async (id, comment) => {
    const res = await api.post(`/tasks/${id}/comments`, { comment });
    return res.data.data;
  },
  getActivity: async (id) => {
    const res = await api.get(`/tasks/${id}/activity`);
    return res.data.data;
  },
};
