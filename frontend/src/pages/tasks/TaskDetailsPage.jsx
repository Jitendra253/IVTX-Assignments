import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import FolderIcon from '@mui/icons-material/Folder';
import { useDispatch, useSelector } from 'react-redux';

import {
  useGetTaskByIdQuery,
  useUpdateTaskStatusMutation,
  useUpdateTaskProgressMutation,
  useDeleteTaskMutation,
} from '../../store/api/apiSlice.js';
import { StatusChip } from '../../components/common/StatusChip.jsx';
import { PriorityChip } from '../../components/common/PriorityChip.jsx';
import { LoadingState } from '../../components/common/LoadingState.jsx';
import { RoleGuard } from '../../components/common/RoleGuard.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import { TaskFormDialog } from './TaskFormDialog.jsx';
import { TaskCommentSection } from '../../components/tasks/TaskCommentSection.jsx';
import { TaskActivityHistory } from '../../components/tasks/TaskActivityHistory.jsx';
import { showSnackbar } from '../../store/slices/uiSlice.js';

export const TaskDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sliderProgress, setSliderProgress] = useState(null);

  // Redux RTK Query hooks
  const { data: task, isLoading } = useGetTaskByIdQuery(id);
  const [updateTaskStatus, { isLoading: isUpdatingStatus }] = useUpdateTaskStatusMutation();
  const [updateTaskProgress, { isLoading: isUpdatingProgress }] = useUpdateTaskProgressMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await updateTaskStatus({ id, status: newStatus }).unwrap();
      dispatch(showSnackbar({ message: `Status updated to ${res.status}`, severity: 'success' }));
    } catch (err) {
      dispatch(
        showSnackbar({
          message: err.data?.message || 'Failed to update status',
          severity: 'error',
        })
      );
    }
  };

  const handleSaveProgress = async () => {
    if (sliderProgress !== null) {
      try {
        const res = await updateTaskProgress({ id, progress: sliderProgress }).unwrap();
        dispatch(showSnackbar({ message: `Progress updated to ${res.progress}%`, severity: 'success' }));
        setSliderProgress(null);
      } catch (err) {
        dispatch(
          showSnackbar({
            message: err.data?.message || 'Failed to update progress',
            severity: 'error',
          })
        );
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(id).unwrap();
      dispatch(showSnackbar({ message: 'Task deleted successfully', severity: 'success' }));
      navigate('/tasks');
    } catch (err) {
      dispatch(
        showSnackbar({
          message: err.data?.message || 'Failed to delete task',
          severity: 'error',
        })
      );
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading task details..." />;
  }

  if (!task) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">Task not found</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/tasks')} sx={{ mt: 2 }}>
          Back to Tasks
        </Button>
      </Box>
    );
  }

  const isOverdue =
    task.status !== 'Completed' && task.dueDate && new Date() > new Date(task.dueDate);

  // Authorization check: Admin or assigned Developer can edit
  const canModify =
    user?.role === 'Admin' ||
    task.assignee?._id === user?._id ||
    task.assignee === user?._id;

  const currentProgress = sliderProgress !== null ? sliderProgress : task.progress;

  return (
    <Box>
      {/* Top Header Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tasks')}
          sx={{ color: 'text.secondary', fontWeight: 600 }}
        >
          Back to Tasks
        </Button>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {canModify && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => setEditModalOpen(true)}
              sx={{ fontWeight: 600 }}
            >
              Edit Task
            </Button>
          )}

          <RoleGuard roles={['Admin']}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={() => setDeleteConfirmOpen(true)}
              sx={{ fontWeight: 600 }}
            >
              Delete
            </Button>
          </RoleGuard>
        </Box>
      </Box>

      {/* Main Task Information Card */}
      <Card sx={{ mb: 3.5 }}>
        <CardContent sx={{ p: 3.5 }}>
          {/* Header Row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
                <Chip
                  icon={<FolderIcon fontSize="small" sx={{ color: '#1D4ED8 !important' }} />}
                  label={`${task.project?.name} (${task.project?.projectKey})`}
                  onClick={() => navigate(`/projects/${task.project?._id}`)}
                  sx={{
                    fontWeight: 700,
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    border: '1px solid #BFDBFE',
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#DBEAFE' },
                  }}
                />
                <StatusChip status={task.status} />
                <PriorityChip priority={task.priority} />
                {isOverdue && (
                  <Chip
                    icon={<WarningAmberIcon fontSize="small" />}
                    label="OVERDUE"
                    color="error"
                    size="small"
                    sx={{ fontWeight: 800 }}
                  />
                )}
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1.5 }}>
                {task.title}
              </Typography>
            </Box>

            {/* Quick Status Selector */}
            {canModify && (
              <Box sx={{ minWidth: 170 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Update Status</InputLabel>
                  <Select
                    value={task.status}
                    label="Update Status"
                    disabled={isUpdatingStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <MenuItem value="To Do">To Do</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Under Review">Under Review</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </Box>

          {/* Description */}
          <Typography
            variant="body1"
            sx={{
              color: '#334155',
              backgroundColor: '#F8FAFC',
              p: 2.5,
              borderRadius: 2.5,
              border: '1px solid #E2E8F0',
              mb: 3,
              whiteSpace: 'pre-line',
            }}
          >
            {task.description || 'No detailed instructions provided.'}
          </Typography>

          {/* Progress Slider (Interactive for authorized users) */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              mb: 3.5,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Completion Progress
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.light' }}>
                  {currentProgress}%
                </Typography>
                {canModify && sliderProgress !== null && sliderProgress !== task.progress && (
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    disabled={isUpdatingProgress}
                    onClick={handleSaveProgress}
                    sx={{ fontWeight: 700, py: 0.5 }}
                  >
                    Save Progress
                  </Button>
                )}
              </Box>
            </Box>

            <Slider
              value={currentProgress}
              disabled={!canModify || isUpdatingProgress}
              onChange={(_, val) => setSliderProgress(val)}
              valueLabelDisplay="auto"
              step={5}
              min={0}
              max={100}
              sx={{ color: task.status === 'Completed' ? '#10B981' : '#6366F1' }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Rule note: Setting to 100% sets status to Completed; setting to 0% resets to To Do.
            </Typography>
          </Box>

          <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.06)' }} />

          {/* Metadata Row */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ backgroundColor: '#06B6D4', width: 38, height: 38 }}>
                  {task.assignee?.name ? task.assignee.name[0] : 'D'}
                </Avatar>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Assigned Developer
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {task.assignee?.name || 'Unassigned'}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PersonOutlineIcon sx={{ color: 'primary.light', fontSize: 24 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Created By
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {task.createdBy?.name || 'Admin'}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CalendarTodayIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Start Date
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {dayjs(task.startDate).format('MMM D, YYYY')}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CalendarTodayIcon
                  sx={{ color: isOverdue ? 'error.main' : 'primary.light', fontSize: 20 }}
                />
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Due Date
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: isOverdue ? 'error.main' : 'text.primary' }}
                  >
                    {dayjs(task.dueDate).format('MMM D, YYYY')}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Comments and Activity Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <TaskCommentSection taskId={task._id} />
        </Grid>
        <Grid item xs={12} lg={5}>
          <TaskActivityHistory taskId={task._id} />
        </Grid>
      </Grid>

      {/* Modals */}
      <TaskFormDialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        task={task}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title={`Delete "${task.title}"?`}
        message="Are you sure you want to delete this task? All comments and activity logs will be permanently deleted."
        confirmText="Delete Task"
        onConfirm={handleDelete}
        onClose={() => setDeleteConfirmOpen(false)}
        loading={isDeleting}
      />
    </Box>
  );
};
