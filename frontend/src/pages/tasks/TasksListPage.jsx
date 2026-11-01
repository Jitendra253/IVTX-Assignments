import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  Menu,
  FormControlLabel,
  Checkbox,
  Chip,
  Pagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useDispatch, useSelector } from 'react-redux';

import {
  useGetProjectsQuery,
  useGetUsersQuery,
  useGetTasksQuery,
  useDeleteTaskMutation,
} from '../../store/api/apiSlice.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatusChip } from '../../components/common/StatusChip.jsx';
import { PriorityChip } from '../../components/common/PriorityChip.jsx';
import { ProjectProgress } from '../../components/common/ProjectProgress.jsx';
import { LoadingState } from '../../components/common/LoadingState.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { RoleGuard } from '../../components/common/RoleGuard.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import { TaskFormDialog } from './TaskFormDialog.jsx';
import { showSnackbar } from '../../store/slices/uiSlice.js';

export const TasksListPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);

  // Filters from searchParams or state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [projectFilter, setProjectFilter] = useState(searchParams.get('project') || 'All');
  const [assigneeFilter, setAssigneeFilter] = useState(searchParams.get('assignee') || 'All');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || 'All');
  const [overdueOnly, setOverdueOnly] = useState(searchParams.get('overdue') === 'true');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuTask, setMenuTask] = useState(null);

  // Redux RTK Query hooks
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: developers = [] } = useGetUsersQuery({ role: 'Developer' });

  const { data: taskData, isLoading } = useGetTasksQuery({
    search: searchTerm || undefined,
    project: projectFilter === 'All' ? undefined : projectFilter,
    assignee: assigneeFilter === 'All' ? undefined : assigneeFilter,
    status: statusFilter === 'All' ? undefined : statusFilter,
    priority: priorityFilter === 'All' ? undefined : priorityFilter,
    overdue: overdueOnly ? 'true' : undefined,
    page,
    limit: 15,
  });

  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  const tasks = taskData?.data || [];
  const pagination = taskData?.pagination || { total: 0, totalPages: 1 };

  const handleOpenMenu = (event, task) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuTask(task);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setMenuTask(null);
  };

  const handleEdit = (task) => {
    handleCloseMenu();
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleDeletePrompt = (task) => {
    handleCloseMenu();
    setTaskToDelete(task);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (taskToDelete) {
      try {
        await deleteTask(taskToDelete._id).unwrap();
        dispatch(showSnackbar({ message: 'Task deleted successfully', severity: 'success' }));
        setDeleteConfirmOpen(false);
        setTaskToDelete(null);
      } catch (err) {
        dispatch(
          showSnackbar({
            message: err.data?.message || 'Failed to delete task',
            severity: 'error',
          })
        );
      }
    }
  };

  const isOverdue = (task) => {
    if (task.status === 'Completed') return false;
    return Boolean(task.dueDate && new Date() > new Date(task.dueDate));
  };

  const canEdit = (task) => {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    return task.assignee?._id === user._id || task.assignee === user._id;
  };

  return (
    <Box>
      <PageHeader
        title="Workspace Tasks"
        subtitle="Search, filter, prioritize, and manage tasks across all projects"
        extraActions={
          <RoleGuard roles={['Admin']}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingTask(null);
                setModalOpen(true);
              }}
              sx={{ fontWeight: 700 }}
            >
              Create Task
            </Button>
          </RoleGuard>
        }
      />

      {/* Filter Toolbar */}
      <Card sx={{ p: 2.5, mb: 3.5 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search tasks by title..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <TextField
              fullWidth
              select
              size="small"
              label="Project"
              value={projectFilter}
              onChange={(e) => {
                setProjectFilter(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="All">All Projects</MenuItem>
              {projects.map((p) => (
                <MenuItem key={p._id} value={p._id}>
                  {p.projectKey}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <TextField
              fullWidth
              select
              size="small"
              label="Assignee"
              value={assigneeFilter}
              onChange={(e) => {
                setAssigneeFilter(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="All">All Assignees</MenuItem>
              {developers.map((d) => (
                <MenuItem key={d._id} value={d._id}>
                  {d.name.split(' ')[0]}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <TextField
              fullWidth
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="To Do">To Do</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Under Review">Under Review</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <TextField
              fullWidth
              select
              size="small"
              label="Priority"
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="All">All Priorities</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={overdueOnly}
                  onChange={(e) => {
                    setOverdueOnly(e.target.checked);
                    setPage(1);
                  }}
                  color="error"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 600, color: overdueOnly ? 'error.main' : 'text.secondary' }}>
                  Show Overdue Tasks Only
                </Typography>
              }
            />

            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Showing {tasks.length} of {pagination.total} tasks
            </Typography>
          </Grid>
        </Grid>
      </Card>

      {/* Task List Table */}
      {isLoading ? (
        <LoadingState message="Loading tasks..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks match your criteria"
          description="Try broadening your search or filters to see more tasks."
          actionText="Create New Task"
          onAction={() => {
            setEditingTask(null);
            setModalOpen(true);
          }}
        />
      ) : (
        <Card>
          <TableContainer component={Paper} sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task Title & Project</TableCell>
                  <TableCell>Assignee</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell sx={{ minWidth: 140 }}>Progress</TableCell>
                  <TableCell align="right">Due Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => {
                  const overdue = isOverdue(task);
                  return (
                    <TableRow
                      key={task._id}
                      hover
                      onClick={() => navigate(`/tasks/${task._id}`)}
                      sx={{
                        cursor: 'pointer',
                        backgroundColor: overdue ? 'rgba(244, 63, 94, 0.04)' : 'transparent',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Chip
                            label={task.project?.projectKey || 'PROJ'}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              backgroundColor: '#EFF6FF',
                              color: '#1D4ED8',
                              border: '1px solid #BFDBFE',
                            }}
                          />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {task.title}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {task.project?.name}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {task.assignee?.name || 'Unassigned'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <PriorityChip priority={task.priority} size="small" />
                      </TableCell>

                      <TableCell>
                        <StatusChip status={task.status} size="small" />
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            {task.progress}%
                          </Typography>
                        </Box>
                        <ProjectProgress percentage={task.progress} showDetails={false} height={6} />
                      </TableCell>

                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                          {overdue && <WarningAmberIcon sx={{ fontSize: 16, color: 'error.main' }} />}
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              color: overdue ? 'error.main' : 'text.secondary',
                            }}
                          >
                            {dayjs(task.dueDate).format('MMM D, YYYY')}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <IconButton size="small" onClick={(e) => handleOpenMenu(e, task)}>
                          <MoreVertIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2.5 }}>
              <Pagination
                count={pagination.totalPages}
                page={page}
                onChange={(_, val) => setPage(val)}
                color="primary"
              />
            </Box>
          )}
        </Card>
      )}

      {/* Action Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenu}>
        <MenuItem
          onClick={() => {
            const id = menuTask?._id;
            handleCloseMenu();
            navigate(`/tasks/${id}`);
          }}
        >
          <VisibilityIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
          View Details
        </MenuItem>

        {menuTask && canEdit(menuTask) && (
          <MenuItem onClick={() => handleEdit(menuTask)}>
            <EditIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
            Edit Task
          </MenuItem>
        )}

        <RoleGuard roles={['Admin']}>
          <MenuItem onClick={() => handleDeletePrompt(menuTask)} sx={{ color: 'error.main' }}>
            <DeleteOutlineIcon fontSize="small" sx={{ mr: 1.5, color: 'error.main' }} />
            Delete Task
          </MenuItem>
        </RoleGuard>
      </Menu>

      {/* Modals */}
      <TaskFormDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        task={editingTask}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title={`Delete "${taskToDelete?.title}"?`}
        message="Are you sure you want to delete this task? All comments and activity logs will be permanently deleted."
        confirmText="Delete Task"
        onConfirm={confirmDelete}
        onClose={() => setDeleteConfirmOpen(false)}
        loading={isDeleting}
      />
    </Box>
  );
};
