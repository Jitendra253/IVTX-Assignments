import React, { useState } from 'react';
import dayjs from 'dayjs';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';

import { useGetUsersQuery, useCreateUserMutation } from '../../store/api/apiSlice.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { LoadingState } from '../../components/common/LoadingState.jsx';
import { RoleGuard } from '../../components/common/RoleGuard.jsx';
import { showSnackbar } from '../../store/slices/uiSlice.js';

const newMemberSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Valid email address required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Admin', 'Developer']),
});

export const TeamMembersPage = () => {
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);

  // Redux RTK Query
  const { data: users = [], isLoading } = useGetUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(newMemberSchema),
    defaultValues: {
      name: '',
      email: '',
      password: 'Dev@123',
      role: 'Developer',
    },
  });

  const onSubmit = async (formData) => {
    try {
      await createUser(formData).unwrap();
      dispatch(showSnackbar({ message: 'Team member added successfully', severity: 'success' }));
      reset();
      setModalOpen(false);
    } catch (err) {
      dispatch(
        showSnackbar({
          message: err.data?.message || 'Failed to add team member',
          severity: 'error',
        })
      );
    }
  };

  const getInitials = (name = '') =>
    name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  return (
    <Box>
      <PageHeader
        title="Engineering Team Directory"
        subtitle="Manage developers, architects, and technical lead access profiles"
        extraActions={
          <RoleGuard roles={['Admin']}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                reset();
                setModalOpen(true);
              }}
              sx={{ fontWeight: 700 }}
            >
              Add Member
            </Button>
          </RoleGuard>
        }
      />

      {isLoading ? (
        <LoadingState message="Loading engineering team roster..." />
      ) : (
        <Grid container spacing={3}>
          {users.map((member) => (
            <Grid item xs={12} sm={6} md={4} key={member._id}>
              <Card sx={{ height: '100%', p: 1 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                    <Avatar
                      sx={{
                        width: 52,
                        height: 52,
                        backgroundColor: member.role === 'Admin' ? '#6366F1' : '#06B6D4',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      {getInitials(member.name)}
                    </Avatar>

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                        {member.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={member.role === 'Admin' ? 'Tech Lead / Admin' : 'Developer'}
                        sx={{
                          mt: 0.5,
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: member.role === 'Admin' ? '#EFF6FF' : '#F0FDFA',
                          color: member.role === 'Admin' ? '#1D4ED8' : '#0F766E',
                          border: member.role === 'Admin' ? '1px solid #BFDBFE' : '1px solid #99F6E4',
                        }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, pt: 1.5, borderTop: '1px solid #E2E8F0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                        {member.email}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarMonthIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Joined {dayjs(member.createdAt).format('MMMM YYYY')}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                      <Chip
                        label={member.isActive ? 'Active Member' : 'Inactive'}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: member.isActive ? '#ECFDF5' : '#FEF2F2',
                          color: member.isActive ? '#065F46' : '#991B1B',
                          border: member.isActive ? '1px solid #A7F3D0' : '1px solid #FECACA',
                        }}
                      />
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                        IVTEX Solutions
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Member Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Add Engineering Team Member</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                fullWidth
                label="Full Name"
                {...register('name')}
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
                placeholder="e.g. Rachel Adams"
              />

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                {...register('email')}
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                placeholder="e.g. rachel.dev@ivtex.com"
              />

              <TextField
                fullWidth
                label="Initial Password"
                type="password"
                {...register('password')}
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
              />

              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <TextField fullWidth select label="Role" {...field}>
                    <MenuItem value="Developer">Developer</MenuItem>
                    <MenuItem value="Admin">Admin / Tech Lead</MenuItem>
                  </TextField>
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setModalOpen(false)} disabled={isCreating} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isCreating}
              sx={{ fontWeight: 700 }}
            >
              {isCreating ? <CircularProgress size={20} color="inherit" /> : 'Add Member'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
