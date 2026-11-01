import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
  AvatarGroup,
  Avatar,
  Chip,
  InputAdornment,
  Menu,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useDispatch } from 'react-redux';

import { useGetProjectsQuery, useDeleteProjectMutation } from '../../store/api/apiSlice.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { StatusChip } from '../../components/common/StatusChip.jsx';
import { ProjectProgress } from '../../components/common/ProjectProgress.jsx';
import { LoadingState } from '../../components/common/LoadingState.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { RoleGuard } from '../../components/common/RoleGuard.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import { ProjectFormDialog } from './ProjectFormDialog.jsx';
import { showSnackbar } from '../../store/slices/uiSlice.js';

export const ProjectsListPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Action Menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuProject, setMenuProject] = useState(null);

  // Redux RTK Query
  const { data: projects = [], isLoading } = useGetProjectsQuery({
    search: searchTerm || undefined,
    status: statusFilter === 'All' ? undefined : statusFilter,
  });

  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  const handleOpenMenu = (event, project) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuProject(project);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setMenuProject(null);
  };

  const handleEdit = (project) => {
    handleCloseMenu();
    setEditingProject(project);
    setModalOpen(true);
  };

  const handleDeletePrompt = (project) => {
    handleCloseMenu();
    setProjectToDelete(project);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (projectToDelete) {
      try {
        await deleteProject(projectToDelete._id).unwrap();
        dispatch(showSnackbar({ message: 'Project deleted successfully', severity: 'success' }));
        setDeleteConfirmOpen(false);
        setProjectToDelete(null);
      } catch (err) {
        dispatch(
          showSnackbar({
            message: err.data?.message || 'Failed to delete project',
            severity: 'error',
          })
        );
      }
    }
  };

  return (
    <Box>
      <PageHeader
        title="Enterprise Projects"
        subtitle="Manage initiatives, monitor completion metrics, and track resource allocation"
        extraActions={
          <RoleGuard roles={['Admin']}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingProject(null);
                setModalOpen(true);
              }}
              sx={{ fontWeight: 700 }}
            >
              Create Project
            </Button>
          </RoleGuard>
        }
      />

      {/* Filter & Search Bar */}
      <Card sx={{ p: 2, mb: 3.5 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search projects by name, key, or scope..."
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
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              fullWidth
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Planning">Planning</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="On Hold">On Hold</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3} sx={{ textAlign: { md: 'right' } }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Showing {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </Typography>
          </Grid>
        </Grid>
      </Card>

      {/* Projects Grid */}
      {isLoading ? (
        <LoadingState message="Loading projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Try adjusting your search criteria or create a new corporate project."
          actionText="Create New Project"
          onAction={() => {
            setEditingProject(null);
            setModalOpen(true);
          }}
        />
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} md={6} lg={4} key={project._id}>
              <Card
                onClick={() => navigate(`/projects/${project._id}`)}
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 12px 30px -8px rgba(99, 102, 241, 0.25)',
                  },
                }}
              >
                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Header Row */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={project.projectKey}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          backgroundColor: '#EFF6FF',
                          color: '#1D4ED8',
                          border: '1px solid #BFDBFE',
                          letterSpacing: '0.05em',
                        }}
                      />
                      <StatusChip status={project.status} size="small" />
                    </Box>

                    <RoleGuard roles={['Admin']}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenMenu(e, project)}
                        sx={{ color: 'text.secondary' }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </RoleGuard>
                  </Box>

                  {/* Project Title & Description */}
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
                    {project.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      mb: 2.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flexGrow: 1,
                    }}
                  >
                    {project.description || 'No description provided.'}
                  </Typography>

                  {/* Progress Bar */}
                  <Box sx={{ mb: 2.5 }}>
                    <ProjectProgress
                      percentage={project.completionPercentage}
                      completedTasks={project.completedTasks}
                      totalTasks={project.totalTasks}
                      overdueTasks={project.overdueTasks}
                    />
                  </Box>

                  {/* Footer Meta */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      pt: 2,
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Due {project.endDate ? dayjs(project.endDate).format('MMM D, YYYY') : 'TBD'}
                      </Typography>
                    </Box>

                    {project.members && project.members.length > 0 && (
                      <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.65rem' } }}>
                        {project.members.map((m) => (
                          <Avatar key={m._id || m} sx={{ backgroundColor: '#06B6D4' }}>
                            {m.name ? m.name[0] : 'U'}
                          </Avatar>
                        ))}
                      </AvatarGroup>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Action Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenu}>
        <MenuItem
          onClick={() => {
            const id = menuProject?._id;
            handleCloseMenu();
            navigate(`/projects/${id}`);
          }}
        >
          <VisibilityIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleEdit(menuProject)}>
          <EditIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
          Edit Project
        </MenuItem>
        <MenuItem onClick={() => handleDeletePrompt(menuProject)} sx={{ color: 'error.main' }}>
          <DeleteOutlineIcon fontSize="small" sx={{ mr: 1.5, color: 'error.main' }} />
          Delete Project
        </MenuItem>
      </Menu>

      {/* Modals */}
      <ProjectFormDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        project={editingProject}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title={`Delete Project "${projectToDelete?.name}"?`}
        message="Are you sure you want to delete this project? All associated tasks, comments, and activity histories will be permanently removed."
        confirmText="Delete Project"
        onConfirm={confirmDelete}
        onClose={() => setDeleteConfirmOpen(false)}
        loading={isDeleting}
      />
    </Box>
  );
};
