import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

import {
  useGetDashboardSummaryQuery,
  useGetProjectProgressQuery,
  useGetTaskDistributionQuery,
  useGetDeveloperWorkloadQuery,
  useGetUpcomingDeadlinesQuery,
  useGetOverdueTasksQuery,
  useGetRecentActivityQuery,
} from '../../store/api/apiSlice.js';

import { StatCard } from '../../components/common/StatCard.jsx';
import { StatusChip } from '../../components/common/StatusChip.jsx';
import { PriorityChip } from '../../components/common/PriorityChip.jsx';
import { ProjectProgress } from '../../components/common/ProjectProgress.jsx';
import { LoadingState } from '../../components/common/LoadingState.jsx';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { RoleGuard } from '../../components/common/RoleGuard.jsx';
import { TaskFormDialog } from '../tasks/TaskFormDialog.jsx';
import { ProjectFormDialog } from '../projects/ProjectFormDialog.jsx';

const STATUS_COLORS = {
  'To Do': '#94A3B8',
  'In Progress': '#6366F1',
  'Under Review': '#F59E0B',
  'Completed': '#10B981',
};

const PRIORITY_COLORS = {
  High: '#F43F5E',
  Medium: '#F59E0B',
  Low: '#0EA5E9',
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  // Redux RTK Query hooks
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummaryQuery();
  const { data: projectProgress = [] } = useGetProjectProgressQuery();
  const { data: distribution } = useGetTaskDistributionQuery();
  const { data: workload = [] } = useGetDeveloperWorkloadQuery();
  const { data: upcomingDeadlines = [] } = useGetUpcomingDeadlinesQuery();
  const { data: overdueTasks = [] } = useGetOverdueTasksQuery();
  const { data: activities = [] } = useGetRecentActivityQuery();

  if (loadingSummary) {
    return <LoadingState message="Loading live executive dashboard metrics..." />;
  }

  // Format distribution for Recharts
  const statusChartData =
    distribution?.byStatus?.map((item) => ({
      name: item.status,
      value: item.count,
      color: STATUS_COLORS[item.status] || '#6366F1',
    })) || [];

  const priorityChartData =
    distribution?.byPriority?.map((item) => ({
      name: item.priority,
      tasks: item.count,
      fill: PRIORITY_COLORS[item.priority] || '#6366F1',
    })) || [];

  return (
    <Box>
      <PageHeader
        title="Executive Overview"
        subtitle="Real-time KPI metrics, project health, team workload, and upcoming deadlines"
        extraActions={
          <RoleGuard roles={['Admin']}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setProjectModalOpen(true)}
              sx={{ fontWeight: 700 }}
            >
              New Project
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setTaskModalOpen(true)}
              sx={{ fontWeight: 700 }}
            >
              New Task
            </Button>
          </RoleGuard>
        }
      />

      {/* 7 Core KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4, alignItems: 'stretch' }}>
        <Grid item xs={12} sm={6} md={3} lg={1.71} sx={{ display: 'flex' }}>
          <StatCard
            title="Active Projects"
            value={summary?.activeProjects || 0}
            subtitle={`of ${summary?.totalProjects || 0} total`}
            icon={FolderIcon}
            color="#6366F1"
            onClick={() => navigate('/projects')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={1.71} sx={{ display: 'flex' }}>
          <StatCard
            title="Total Tasks"
            value={summary?.totalTasks || 0}
            subtitle="Across all boards"
            icon={AssignmentIcon}
            color="#38BDF8"
            onClick={() => navigate('/tasks')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={1.71} sx={{ display: 'flex' }}>
          <StatCard
            title="Completed"
            value={summary?.completedTasks || 0}
            subtitle="100% progress"
            icon={CheckCircleIcon}
            color="#10B981"
            trend={{ label: 'Done', type: 'positive' }}
            onClick={() => navigate('/tasks?status=Completed')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={1.71} sx={{ display: 'flex' }}>
          <StatCard
            title="Pending Tasks"
            value={summary?.pendingTasks || 0}
            subtitle="Awaiting finish"
            icon={PendingActionsIcon}
            color="#F59E0B"
            onClick={() => navigate('/tasks')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={1.71} sx={{ display: 'flex' }}>
          <StatCard
            title="In Progress"
            value={summary?.inProgressTasks || 0}
            subtitle="Under active dev"
            icon={AutorenewIcon}
            color="#818CF8"
            onClick={() => navigate('/tasks?status=In Progress')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={1.71} sx={{ display: 'flex' }}>
          <StatCard
            title="Under Review"
            value={summary?.underReviewTasks || 0}
            subtitle="Pending sign-off"
            icon={RateReviewIcon}
            color="#FBBF24"
            onClick={() => navigate('/tasks?status=Under Review')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={1.71} sx={{ display: 'flex' }}>
          <StatCard
            title="Overdue Tasks"
            value={summary?.overdueTasks || 0}
            subtitle="Past due date"
            icon={WarningAmberIcon}
            color="#F43F5E"
            trend={{ label: 'Urgent', type: 'negative' }}
            onClick={() => navigate('/tasks?overdue=true')}
          />
        </Grid>
      </Grid>

      {/* Analytics Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Status Donut Chart */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Task Distribution by Status
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                Current lifecycle allocation of all workspace tasks
              </Typography>

              <Box sx={{ width: '100%', height: 260 }}>
                {statusChartData.length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>No tasks found</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={4}
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: 8,
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          color: '#0F172A',
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Priority Bar Chart */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Task Distribution by Priority
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                Severity classification across active backlog
              </Typography>

              <Box sx={{ width: '100%', height: 260 }}>
                {priorityChartData.length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>No tasks found</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priorityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                      <YAxis stroke="#64748B" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: 8,
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          color: '#0F172A',
                        }}
                      />
                      <Bar dataKey="tasks" radius={[6, 6, 0, 0]}>
                        {priorityChartData.map((entry, index) => (
                          <Cell key={`bar-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Developer Workload Chart */}
        <Grid item xs={12} md={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Developer Workload Summary
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                Assigned active and completed task capacity
              </Typography>

              <Box sx={{ width: '100%', height: 260 }}>
                {workload.length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>No developers found</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={workload.map((w) => ({
                        name: w.name.split(' ')[0],
                        completed: w.completed,
                        active: w.totalAssigned - w.completed,
                      }))}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                    >
                      <XAxis type="number" stroke="#64748B" fontSize={12} />
                      <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: 8,
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          color: '#0F172A',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="completed" name="Completed" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="active" name="Active / Pending" stackId="a" fill="#6366F1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Projects Progress & Upcoming Deadlines */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Project Progress Table */}
        <Grid item xs={12} lg={7}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Project Completion Progress
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Calculated dynamically from MongoDB task completion data
                  </Typography>
                </Box>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/projects')}
                  sx={{ color: 'primary.light', fontWeight: 600 }}
                >
                  View All
                </Button>
              </Box>

              <TableContainer component={Paper} sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Project</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell sx={{ minWidth: 200 }}>Progress</TableCell>
                      <TableCell align="right">Due Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {projectProgress.slice(0, 5).map((p) => (
                      <TableRow
                        key={p._id}
                        hover
                        onClick={() => navigate(`/projects/${p._id}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {p.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {p.projectKey}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <StatusChip status={p.status} size="small" />
                        </TableCell>
                        <TableCell>
                          <ProjectProgress
                            percentage={p.completionPercentage}
                            completedTasks={p.completedTasks}
                            totalTasks={p.totalTasks}
                            overdueTasks={p.overdueTasks}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {p.endDate ? dayjs(p.endDate).format('MMM D, YYYY') : '—'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Deadlines & Overdue Alerts */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Upcoming & Overdue Tasks
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Items requiring immediate developer attention
                  </Typography>
                </Box>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/tasks')}
                  sx={{ color: 'primary.light', fontWeight: 600 }}
                >
                  All Tasks
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {overdueTasks.slice(0, 3).map((task) => (
                  <Box
                    key={`overdue-${task._id}`}
                    onClick={() => navigate(`/tasks/${task._id}`)}
                    sx={{
                      p: 1.75,
                      borderRadius: 2.5,
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#DC2626' }}>
                        {task.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 700 }}>
                        OVERDUE
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        {task.project?.name} • Assigned to {task.assignee?.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#DC2626', fontWeight: 600 }}>
                        Due {dayjs(task.dueDate).format('MMM D')}
                      </Typography>
                    </Box>
                  </Box>
                ))}

                {upcomingDeadlines.slice(0, 4).map((task) => (
                  <Box
                    key={`upcoming-${task._id}`}
                    onClick={() => navigate(`/tasks/${task._id}`)}
                    sx={{
                      p: 1.75,
                      borderRadius: 2.5,
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                        {task.title}
                      </Typography>
                      <PriorityChip priority={task.priority} size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        {task.project?.name} • {task.assignee?.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600 }}>
                        Due {dayjs(task.dueDate).format('MMM D, YYYY')}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Workspace Activity Stream */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: '#0F172A' }}>
            Recent Activity Audit Stream
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
            Latest task modifications, status updates, and developer progress logs
          </Typography>

          <Grid container spacing={2}>
            {activities.slice(0, 8).map((act) => (
              <Grid item xs={12} sm={6} md={3} key={act._id}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                      borderColor: '#CBD5E1',
                    },
                  }}
                >
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 0.5, fontWeight: 500 }}>
                      {dayjs(act.createdAt).fromNow()}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                      {act.actor?.name || 'User'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#0D9488', fontWeight: 700, display: 'block' }}>
                      {act.action}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ color: '#64748B', display: 'block', mt: 1, fontStyle: 'italic' }}
                    noWrap
                  >
                    Task: {act.task?.title || 'System'}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Modals */}
      <ProjectFormDialog
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
      />
      <TaskFormDialog
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
      />
    </Box>
  );
};
