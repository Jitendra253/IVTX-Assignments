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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useDispatch } from 'react-redux';

import {
  useGetProjectByIdQuery,
  useGetProjectTasksQuery,
  useDeleteProjectMutation,
} from '../../store/api/apiSlice.js';
import { StatusChip } from '../../components/common/StatusChip.jsx';
import { PriorityChip } from '../../components/common/PriorityChip.jsx';
import { ProjectProgress } from '../../components/common/ProjectProgress.jsx';
import { LoadingState } from '../../components/common/LoadingState.jsx';
import { RoleGuard } from '../../components/common/RoleGuard.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import { ProjectFormDialog } from './ProjectFormDialog.jsx';
import { TaskFormDialog } from '../tasks/TaskFormDialog.jsx';
import { showSnackbar } from '../../store/slices/uiSlice.js';

export const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Redux RTK Query hooks
  const { data: project, isLoading: loadingProject } = useGetProjectByIdQuery(id);
  const { data: tasks = [], isLoading: loadingTasks } = useGetProjectTasksQuery({ id });
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  const handleDelete = async () => {
    try {
      await deleteProject(id).unwrap();
      dispatch(showSnackbar({ message: 'Project deleted successfully', severity: 'success' }));
      navigate('/projects');
    } catch (err) {
      dispatch(
        showSnackbar({
          message: err.data?.message || 'Failed to delete project',
          severity: 'error',
        })
      );
    }
  };

  if (loadingProject) {
    return <LoadingState message="Loading project details..." />;
  }

  if (!project) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">Project not found</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/projects')} sx={{ mt: 2 }}>
          Back to Projects
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Back Button & Action Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/projects')}
          sx={{ color: 'text.secondary', fontWeight: 600 }}
        >
          Back to Projects
        </Button>

        <RoleGuard roles={['Admin']}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => setEditModalOpen(true)}
              sx={{ fontWeight: 600 }}
            >
              Edit Project
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={() => setDeleteConfirmOpen(true)}
              sx={{ fontWeight: 600 }}
            >
              Delete
            </Button>
          </Box>
        </RoleGuard>
      </Box>

      {/* Main Project Overview Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Chip
                  label={project.projectKey}
                  sx={{
                    fontWeight: 800,
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    border: '1px solid #BFDBFE',
                  }}
                />
                <StatusChip status={project.status} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
                {project.name}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 800 }}>
                {project.description || 'No detailed scope provided.'}
              </Typography>
            </Box>

            {/* Completion Percentage Badge */}
            <Box
              sx={{
                textAlign: 'center',
                p: 2.5,
                borderRadius: 3,
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                minWidth: 160,
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                COMPLETION
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#10B981', my: 0.5 }}>
                {project.completionPercentage}%
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {project.completedTasks} of {project.totalTasks} Tasks
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.06)' }} />

          {/* Metadata Grid */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CalendarTodayIcon sx={{ color: 'primary.light', fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Project Timeline
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {dayjs(project.startDate).format('MMM D, YYYY')} – {dayjs(project.endDate).format('MMM D, YYYY')}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PersonOutlineIcon sx={{ color: 'secondary.light', fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Project Owner
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {project.owner?.name || 'Administrator'}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                Team Members ({project.members?.length || 0})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {project.members && project.members.length > 0 ? (
                  project.members.map((m) => (
                    <Chip
                      key={m._id}
                      avatar={<Avatar sx={{ backgroundColor: '#0D9488', color: '#FFFFFF' }}>{m.name[0]}</Avatar>}
                      label={m.name}
                      size="small"
                      sx={{
                        backgroundColor: '#F8FAFC',
                        color: '#0F172A',
                        border: '1px solid #E2E8F0',
                        fontWeight: 600,
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    No specific members assigned.
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Embedded Project Tasks Section */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Project Tasks ({tasks.length})
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                All tasks assigned to developers for this milestone
              </Typography>
            </Box>

            <RoleGuard roles={['Admin']}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setTaskModalOpen(true)}
                sx={{ fontWeight: 700 }}
              >
                Add Task
              </Button>
            </RoleGuard>
          </Box>

          {loadingTasks ? (
            <LoadingState message="Loading tasks..." />
          ) : tasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5, border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: 3 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                No tasks have been created under this project yet.
              </Typography>
              <RoleGuard roles={['Admin']}>
                <Button variant="outlined" color="primary" onClick={() => setTaskModalOpen(true)}>
                  Create Initial Task
                </Button>
              </RoleGuard>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Task Title</TableCell>
                    <TableCell>Assignee</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell align="right">Due Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow
                      key={task._id}
                      hover
                      onClick={() => navigate(`/tasks/${task._id}`)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {task.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', noWrap: true }}>
                          {task.description ? task.description.slice(0, 60) + '...' : ''}
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
                      <TableCell sx={{ minWidth: 120 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5, display: 'block' }}>
                          {task.progress}%
                        </Typography>
                        <ProjectProgress percentage={task.progress} showDetails={false} height={6} />
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color:
                              task.status !== 'Completed' && new Date() > new Date(task.dueDate)
                                ? 'error.main'
                                : 'text.secondary',
                          }}
                        >
                          {dayjs(task.dueDate).format('MMM D, YYYY')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <ProjectFormDialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        project={project}
      />

      <TaskFormDialog
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        defaultProjectId={project._id}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title={`Delete "${project.name}"?`}
        message="Are you sure you want to delete this project? All associated tasks, comments, and activities will be removed permanently."
        confirmText="Delete Project"
        onConfirm={handleDelete}
        onClose={() => setDeleteConfirmOpen(false)}
        loading={isDeleting}
      />
    </Box>
  );
};
