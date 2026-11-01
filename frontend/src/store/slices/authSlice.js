import { createSlice } from '@reduxjs/toolkit';

const initialToken = localStorage.getItem('taskflow_token') || null;
const initialUser = localStorage.getItem('taskflow_user')
  ? JSON.parse(localStorage.getItem('taskflow_user'))
  : null;

const initialState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: Boolean(initialToken && initialUser),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('taskflow_token', token);
      localStorage.setItem('taskflow_user', JSON.stringify(user));
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('taskflow_user', JSON.stringify(state.user));
    },
  },
});

export const { setCredentials, logoutUser, updateProfile } = authSlice.actions;
export default authSlice.reducer;
