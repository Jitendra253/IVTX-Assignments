import api from './api.js';

export const userService = {
  getUsers: async (params = {}) => {
    const res = await api.get('/users', { params });
    return res.data.data;
  },
  getUserById: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data.data;
  },
  createUser: async (data) => {
    const res = await api.post('/users', data);
    return res.data.data;
  },
  updateUser: async (id, data) => {
    const res = await api.patch(`/users/${id}`, data);
    return res.data.data;
  },
  updateUserStatus: async (id, isActive) => {
    const res = await api.patch(`/users/${id}/status`, { isActive });
    return res.data.data;
  },
};
