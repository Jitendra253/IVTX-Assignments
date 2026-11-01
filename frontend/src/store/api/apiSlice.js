import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const stateToken = getState().auth?.token;
      const localToken = localStorage.getItem('taskflow_token');
      const token = stateToken || localToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Projects', 'Project', 'Tasks', 'Task', 'Dashboard', 'Comments', 'Activities', 'Users'],
  endpoints: (builder) => ({
    // ==================== DASHBOARD ENDPOINTS ====================
    getDashboardSummary: builder.query({
      query: () => '/dashboard/summary',
      transformResponse: (response) => response.data,
      providesTags: ['Dashboard', 'Projects', 'Tasks'],
    }),
    getProjectProgress: builder.query({
      query: () => '/dashboard/project-progress',
      transformResponse: (response) => response.data,
      providesTags: ['Dashboard', 'Projects', 'Tasks'],
    }),
    getTaskDistribution: builder.query({
      query: () => '/dashboard/task-distribution',
      transformResponse: (response) => response.data,
      providesTags: ['Dashboard', 'Tasks'],
    }),
    getDeveloperWorkload: builder.query({
      query: () => '/dashboard/developer-workload',
      transformResponse: (response) => response.data,
      providesTags: ['Dashboard', 'Tasks', 'Users'],
    }),
    getUpcomingDeadlines: builder.query({
      query: () => '/dashboard/upcoming-deadlines',
      transformResponse: (response) => response.data,
      providesTags: ['Dashboard', 'Tasks'],
    }),
    getOverdueTasks: builder.query({
      query: () => '/dashboard/overdue-tasks',
      transformResponse: (response) => response.data,
      providesTags: ['Dashboard', 'Tasks'],
    }),
    getRecentActivity: builder.query({
      query: () => '/dashboard/recent-activity',
      transformResponse: (response) => response.data,
      providesTags: ['Activities', 'Tasks'],
    }),

    // ==================== PROJECTS ENDPOINTS ====================
    getProjects: builder.query({
      query: (params = {}) => ({
        url: '/projects',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: (result) =>
        result
          ? [...result.map(({ _id }) => ({ type: 'Projects', id: _id })), { type: 'Projects', id: 'LIST' }]
          : [{ type: 'Projects', id: 'LIST' }],
    }),
    getProjectById: builder.query({
      query: (id) => `/projects/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation({
      query: (data) => ({
        url: '/projects',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Projects', id: 'LIST' }, 'Dashboard'],
    }),
    updateProject: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/projects/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Project', id },
        { type: 'Projects', id: 'LIST' },
        'Dashboard',
      ],
    }),
    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Projects', id: 'LIST' }, 'Dashboard', { type: 'Tasks', id: 'LIST' }],
    }),
    getProjectTasks: builder.query({
      query: ({ id, params = {} }) => ({
        url: `/projects/${id}/tasks`,
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['Tasks'],
    }),

    // ==================== TASKS ENDPOINTS ====================
    getTasks: builder.query({
      query: (params = {}) => ({
        url: '/tasks',
        params,
      }),
      transformResponse: (response) => response,
      providesTags: ['Tasks'],
    }),
    getTaskById: builder.query({
      query: (id) => `/tasks/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'Task', id }],
    }),
    createTask: builder.mutation({
      query: (data) => ({
        url: '/tasks',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        'Tasks',
        'Dashboard',
        { type: 'Projects', id: 'LIST' },
        'Activities',
      ],
    }),
    updateTask: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/tasks/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Task', id },
        'Tasks',
        'Dashboard',
        'Projects',
        'Activities',
      ],
    }),
    updateTaskStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/tasks/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Task', id },
        'Tasks',
        'Dashboard',
        'Projects',
        'Activities',
      ],
    }),
    updateTaskProgress: builder.mutation({
      query: ({ id, progress }) => ({
        url: `/tasks/${id}/progress`,
        method: 'PATCH',
        body: { progress },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Task', id },
        'Tasks',
        'Dashboard',
        'Projects',
        'Activities',
      ],
    }),
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        'Tasks',
        'Dashboard',
        { type: 'Projects', id: 'LIST' },
      ],
    }),

    // ==================== COMMENTS & ACTIVITY ====================
    getTaskComments: builder.query({
      query: (taskId) => `/tasks/${taskId}/comments`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, taskId) => [{ type: 'Comments', id: taskId }],
    }),
    addTaskComment: builder.mutation({
      query: ({ taskId, comment }) => ({
        url: `/tasks/${taskId}/comments`,
        method: 'POST',
        body: { comment },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: 'Comments', id: taskId },
        { type: 'Activities', id: taskId },
        'Activities',
      ],
    }),
    getTaskActivity: builder.query({
      query: (taskId) => `/tasks/${taskId}/activity`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, taskId) => [{ type: 'Activities', id: taskId }],
    }),

    // ==================== USERS & TEAM ENDPOINTS ====================
    getUsers: builder.query({
      query: (params = {}) => ({
        url: '/users',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['Users'],
    }),
    createUser: builder.mutation({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Users', 'Dashboard'],
    }),
  }),
});

export const {
  // Dashboard
  useGetDashboardSummaryQuery,
  useGetProjectProgressQuery,
  useGetTaskDistributionQuery,
  useGetDeveloperWorkloadQuery,
  useGetUpcomingDeadlinesQuery,
  useGetOverdueTasksQuery,
  useGetRecentActivityQuery,

  // Projects
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectTasksQuery,

  // Tasks
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useUpdateTaskProgressMutation,
  useDeleteTaskMutation,

  // Comments & Activities
  useGetTaskCommentsQuery,
  useAddTaskCommentMutation,
  useGetTaskActivityQuery,

  // Users
  useGetUsersQuery,
  useCreateUserMutation,
} = apiSlice;
