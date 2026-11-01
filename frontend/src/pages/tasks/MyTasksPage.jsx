import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Box,
  Grid,
  Card,
  Typography,
  TextField,
  MenuItem,
  InputAdornment,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useSelector } from 'react-redux';

import { useGetTasksQuery } from '../../store/api/apiSlice.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatCard } from '../../components/common/StatCard.jsx';
import { StatusChip } from '../../components/common/StatusChip.jsx';
import { PriorityChip } from '../../components/common/PriorityChip.jsx';
import { ProjectProgress } from '../../components/common/ProjectProgress.jsx';
import { LoadingState } from '../../components/common/LoadingState.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';

export const MyTasksPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Redux RTK Query
  const { data: taskData, isLoading } = useGetTasksQuery(
    {
      assignee: user?._id,
      search: searchTerm || undefined,
      status: statusFilter === 'All' ? undefined : statusFilter,
      limit: 100,
    },
    { skip: !user?._id }
  );

  const tasks = taskData?.data || [];

  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const overdueCount = tasks.filter(
    (t) => t.status !== 'Completed' && t.dueDate && new Date() > new Date(t.dueDate)
  ).length;

  return (
    <Box>
      <PageHeader
        title="My Workstream"
        subtitle={`Active assignments, deadlines, and personal progress tracker for ${user?.name}`}
      />

      {/* KPI Cards for logged in user */}
      <Grid container spacing={2.5} sx={{ mb: 3.5, alignItems: 'stretch' }}>
        <Grid item xs={12} sm={4} sx={{ display: 'flex' }}>
          <StatCard
            title="Assigned to Me"
            value={tasks.length}
            subtitle="Current sprint tasks"
            icon={AutorenewIcon}
            color="#6366F1"
          />
        </Grid>
        <Grid item xs={12} sm={4} sx={{ display: 'flex' }}>
          <StatCard
            title="My In Progress"
            value={inProgressCount}
            subtitle="Actively in development"
            icon={AutorenewIcon}
            color="#06B6D4"
          />
        </Grid>
        <Grid item xs={12} sm={4} sx={{ display: 'flex' }}>
          <StatCard
            title="My Overdue"
            value={overdueCount}
            subtitle="Needs immediate attention"
            icon={WarningAmberIcon}
            color="#F43F5E"
            trend={overdueCount > 0 ? { label: 'Action Required', type: 'negative' } : null}
          />
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ p: 2, mb: 3.5 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search your assigned tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="To Do">To Do</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Under Review">Under Review</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {/* Tasks Grid */}
      {isLoading ? (
        <LoadingState message="Loading your tasks..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks assigned"
          description="You currently have no tasks assigned matching this criteria."
        />
      ) : (
        <Grid container spacing={2.5}>
          {tasks.map((task) => {
            const isOverdue =
              task.status !== 'Completed' && task.dueDate && new Date() > new Date(task.dueDate);

            return (
              <Grid item xs={12} md={6} key={task._id}>
                <Card
                  onClick={() => navigate(`/tasks/${task._id}`)}
                  sx={{
                    cursor: 'pointer',
                    p: 2.5,
                    border: isOverdue ? '1px solid rgba(244, 63, 94, 0.4)' : undefined,
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 8px 24px -4px rgba(99, 102, 241, 0.25)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={task.project?.projectKey || 'PROJ'}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          backgroundColor: '#EFF6FF',
                          color: '#1D4ED8',
                          border: '1px solid #BFDBFE',
                        }}
                      />
                      <StatusChip status={task.status} size="small" />
                      <PriorityChip priority={task.priority} size="small" />
                    </Box>

                    {isOverdue && (
                      <Chip
                        label="OVERDUE"
                        size="small"
                        color="error"
                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                      />
                    )}
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                    {task.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {task.description || 'No description provided.'}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <ProjectProgress percentage={task.progress} showDetails={false} height={6} />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: isOverdue ? 'error.main' : 'text.secondary',
                      }}
                    >
                      Due {dayjs(task.dueDate).format('MMM D, YYYY')}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.light' }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        View Details
                      </Typography>
                      <ArrowForwardIcon fontSize="small" />
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};
