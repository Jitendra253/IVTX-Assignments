import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress,
  Typography,
  Slider,
  Box,
} from '@mui/material';
import {
  useGetProjectsQuery,
  useGetUsersQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
} from '../../store/api/apiSlice.js';
import { taskFormSchema } from '../../schemas/taskSchemas.js';
import { showSnackbar } from '../../store/slices/uiSlice.js';

export const TaskFormDialog = ({ open, onClose, task = null, defaultProjectId = '' }) => {
  const dispatch = useDispatch();
  const isEdit = Boolean(task);

  // Redux RTK Query hooks
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: developers = [] } = useGetUsersQuery({ role: 'Developer' });
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      project: defaultProjectId || '',
      assignee: '',
      priority: 'Medium',
      status: 'To Do',
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    },
  });

  const currentStatus = watch('status');

  // React to status changes by updating progress according to business rules
  const handleStatusChange = (newStatus) => {
    setValue('status', newStatus);
    if (newStatus === 'Completed') {
      setValue('progress', 100);
    } else if (newStatus === 'To Do') {
      setValue('progress', 0);
    } else if (newStatus === 'In Progress') {
      const cur = watch('progress');
      if (cur <= 0 || cur >= 100) setValue('progress', 25);
    }
  };

  useEffect(() => {
    if (task) {
      reset({
        title: task.title || '',
        description: task.description || '',
        project: task.project?._id || task.project || defaultProjectId || '',
        assignee: task.assignee?._id || task.assignee || '',
        priority: task.priority || 'Medium',
        status: task.status || 'To Do',
        progress: task.progress !== undefined ? task.progress : 0,
        startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      });
    } else {
      reset({
        title: '',
        description: '',
        project: defaultProjectId || (projects[0]?._id ?? ''),
        assignee: developers[0]?._id ?? '',
        priority: 'Medium',
        status: 'To Do',
        progress: 0,
        startDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      });
    }
  }, [task, defaultProjectId, projects, developers, reset]);

  const onSubmit = async (formData) => {
    try {
      if (isEdit) {
        await updateTask({ id: task._id, ...formData }).unwrap();
      } else {
        await createTask(formData).unwrap();
      }
      dispatch(
        showSnackbar({
          message: `Task ${isEdit ? 'updated' : 'created'} successfully`,
          severity: 'success',
        })
      );
      onClose();
    } catch (err) {
      dispatch(
        showSnackbar({
          message: err.data?.message || `Failed to ${isEdit ? 'update' : 'create'} task`,
          severity: 'error',
        })
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>
        {isEdit ? 'Edit Task' : 'Create New Task'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                {...register('title')}
                error={Boolean(errors.title)}
                helperText={errors.title?.message}
                placeholder="e.g. Design Multi-tenant Sharding Strategy"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Task Description"
                {...register('description')}
                error={Boolean(errors.description)}
                helperText={errors.description?.message}
                placeholder="Technical details, acceptance criteria, or context"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="project"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.project)}>
                    <InputLabel>Project</InputLabel>
                    <Select {...field} label="Project">
                      {projects.map((p) => (
                        <MenuItem key={p._id} value={p._id}>
                          {p.name} ({p.projectKey})
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.project && <FormHelperText>{errors.project.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="assignee"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.assignee)}>
                    <InputLabel>Assigned Developer</InputLabel>
                    <Select {...field} label="Assigned Developer">
                      {developers.map((d) => (
                        <MenuItem key={d._id} value={d._id}>
                          {d.name} ({d.role})
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.assignee && <FormHelperText>{errors.assignee.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select {...field} label="Priority">
                      <MenuItem value="High">High</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="Low">Low</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={field.value}
                      label="Status"
                      onChange={(e) => handleStatusChange(e.target.value)}
                    >
                      <MenuItem value="To Do">To Do</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Under Review">Under Review</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Progress Slider */}
            <Grid item xs={12}>
              <Box sx={{ px: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Task Progress:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.light' }}>
                    {watch('progress')}%
                  </Typography>
                </Box>
                <Controller
                  name="progress"
                  control={control}
                  render={({ field }) => (
                    <Slider
                      value={field.value || 0}
                      onChange={(_, val) => {
                        field.onChange(val);
                        if (val === 100) setValue('status', 'Completed');
                        else if (val === 0) setValue('status', 'To Do');
                        else if (currentStatus === 'To Do' || currentStatus === 'Completed') {
                          setValue('status', 'In Progress');
                        }
                      }}
                      valueLabelDisplay="auto"
                      step={5}
                      min={0}
                      max={100}
                    />
                  )}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                {...register('startDate')}
                error={Boolean(errors.startDate)}
                helperText={errors.startDate?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Due Date"
                InputLabelProps={{ shrink: true }}
                {...register('dueDate')}
                error={Boolean(errors.dueDate)}
                helperText={errors.dueDate?.message}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} disabled={isSubmitting} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            sx={{ fontWeight: 700 }}
          >
            {isSubmitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : isEdit ? (
              'Save Task'
            ) : (
              'Create Task'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
