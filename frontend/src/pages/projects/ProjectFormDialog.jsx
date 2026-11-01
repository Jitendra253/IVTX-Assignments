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
  OutlinedInput,
  Checkbox,
  ListItemText,
} from '@mui/material';
import {
  useGetUsersQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
} from '../../store/api/apiSlice.js';
import { projectFormSchema } from '../../schemas/projectSchemas.js';
import { showSnackbar } from '../../store/slices/uiSlice.js';

export const ProjectFormDialog = ({ open, onClose, project = null }) => {
  const dispatch = useDispatch();
  const isEdit = Boolean(project);

  const { data: users = [] } = useGetUsersQuery();
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();

  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      projectKey: '',
      description: '',
      status: 'Planning',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      members: [],
    },
  });

  useEffect(() => {
    if (project) {
      reset({
        name: project.name || '',
        projectKey: project.projectKey || '',
        description: project.description || '',
        status: project.status || 'Planning',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        members: project.members ? project.members.map((m) => (m._id ? m._id : m)) : [],
      });
    } else {
      reset({
        name: '',
        projectKey: '',
        description: '',
        status: 'Planning',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        members: [],
      });
    }
  }, [project, reset]);

  const onSubmit = async (formData) => {
    try {
      if (isEdit) {
        await updateProject({ id: project._id, ...formData }).unwrap();
      } else {
        await createProject(formData).unwrap();
      }
      dispatch(
        showSnackbar({
          message: `Project ${isEdit ? 'updated' : 'created'} successfully`,
          severity: 'success',
        })
      );
      onClose();
    } catch (err) {
      dispatch(
        showSnackbar({
          message: err.data?.message || `Failed to ${isEdit ? 'update' : 'create'} project`,
          severity: 'error',
        })
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>
        {isEdit ? 'Edit Project' : 'Create New Project'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Project Name"
                {...register('name')}
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
                placeholder="e.g. Enterprise Cloud ERP"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Project Key"
                {...register('projectKey')}
                error={Boolean(errors.projectKey)}
                helperText={errors.projectKey?.message}
                placeholder="e.g. ERP"
                disabled={isEdit}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Project Description"
                {...register('description')}
                error={Boolean(errors.description)}
                helperText={errors.description?.message}
                placeholder="Brief summary of project objectives and scope"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.status)}>
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status">
                      <MenuItem value="Planning">Planning</MenuItem>
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="On Hold">On Hold</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                    </Select>
                    {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
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

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                InputLabelProps={{ shrink: true }}
                {...register('endDate')}
                error={Boolean(errors.endDate)}
                helperText={errors.endDate?.message}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="members"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Assign Team Members</InputLabel>
                    <Select
                      multiple
                      value={field.value || []}
                      onChange={field.onChange}
                      input={<OutlinedInput label="Assign Team Members" />}
                      renderValue={(selected) =>
                        users
                          .filter((u) => selected.includes(u._id))
                          .map((u) => u.name)
                          .join(', ')
                      }
                    >
                      {users.map((u) => (
                        <MenuItem key={u._id} value={u._id}>
                          <Checkbox checked={(field.value || []).includes(u._id)} />
                          <ListItemText primary={`${u.name} (${u.role})`} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
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
              'Save Changes'
            ) : (
              'Create Project'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
