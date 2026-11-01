import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/common/ProtectedRoute.jsx';
import { AppLayout } from '../components/layout/AppLayout.jsx';

import { LoginPage } from '../pages/auth/LoginPage.jsx';
import { DashboardPage } from '../pages/dashboard/DashboardPage.jsx';
import { ProjectsListPage } from '../pages/projects/ProjectsListPage.jsx';
import { ProjectDetailsPage } from '../pages/projects/ProjectDetailsPage.jsx';
import { TasksListPage } from '../pages/tasks/TasksListPage.jsx';
import { TaskDetailsPage } from '../pages/tasks/TaskDetailsPage.jsx';
import { MyTasksPage } from '../pages/tasks/MyTasksPage.jsx';
import { TeamMembersPage } from '../pages/team/TeamMembersPage.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes wrapped in AppLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsListPage />} />
        <Route path="projects/:id" element={<ProjectDetailsPage />} />
        <Route path="tasks" element={<TasksListPage />} />
        <Route path="tasks/:id" element={<TaskDetailsPage />} />
        <Route path="my-tasks" element={<MyTasksPage />} />
        <Route path="team" element={<TeamMembersPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
