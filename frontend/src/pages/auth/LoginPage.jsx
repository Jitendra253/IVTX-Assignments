import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Grid,
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import CodeIcon from '@mui/icons-material/Code';
import { authService } from '../../services/authService.js';
import { setCredentials } from '../../store/slices/authSlice.js';
import { loginFormSchema } from '../../schemas/authSchemas.js';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      setAuthError('');
      setLoading(true);
      const res = await authService.login(values.email, values.password);
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }));

      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (email, password) => {
    setValue('email', email, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setValue('password', password, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    setAuthError('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 20%, #EFF6FF 0%, #F8FAFC 80%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 460,
          width: '100%',
          p: { xs: 1.5, sm: 3 },
          borderRadius: 4,
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        }}
      >
        <CardContent>
          {/* Logo & Header */}
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #2563EB 0%, #0D9488 100%)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
                mb: 2,
              }}
            >
              <RocketLaunchIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5, color: '#0F172A' }}>
              TaskFlow
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              IVTEX Corporate Solutions Project Management
            </Typography>
          </Box>

          {authError && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {authError}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Corporate Email"
              type="email"
              autoComplete="email"
              {...register('email')}
              InputLabelProps={{ shrink: true }}
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              sx={{ mb: 2 }}
              placeholder="e.g. admin@ivtex.com"
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              InputLabelProps={{ shrink: true }}
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              sx={{ mb: 3 }}
              placeholder="••••••••"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockOutlinedIcon />}
              sx={{ py: 1.4, fontWeight: 700, fontSize: '1rem', mb: 3 }}
            >
              {loading ? 'Authenticating...' : 'Sign In to TaskFlow'}
            </Button>
          </Box>

          <Divider sx={{ my: 2.5, borderColor: 'rgba(255, 255, 255, 0.08)' }}>
            <Chip label="Quick Demo Logins" size="small" sx={{ fontSize: '0.7rem', fontWeight: 600 }} />
          </Divider>

          {/* Quick Demo Fill Buttons */}
          <Grid container spacing={1.5}>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<SecurityIcon fontSize="small" />}
                onClick={() => fillCredentials('admin@ivtex.com', 'Admin@123')}
                sx={{
                  justifyContent: 'flex-start',
                  borderColor: '#CBD5E1',
                  py: 1,
                  '&:hover': {
                    borderColor: '#2563EB',
                    backgroundColor: 'rgba(37, 99, 235, 0.04)',
                  },
                }}
              >
                <Box sx={{ textAlign: 'left', flexGrow: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: 'primary.main' }}>
                    Admin / Team Lead
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                    admin@ivtex.com (Full Control)
                  </Typography>
                </Box>
              </Button>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<CodeIcon fontSize="small" />}
                onClick={() => fillCredentials('john.dev@ivtex.com', 'Dev@123')}
                sx={{
                  justifyContent: 'flex-start',
                  borderColor: '#CBD5E1',
                  py: 1,
                  '&:hover': {
                    borderColor: '#0D9488',
                    backgroundColor: 'rgba(13, 148, 136, 0.04)',
                  },
                }}
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: 'secondary.main' }}>
                    Developer (John)
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                    john.dev@ivtex.com
                  </Typography>
                </Box>
              </Button>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<CodeIcon fontSize="small" />}
                onClick={() => fillCredentials('sarah.dev@ivtex.com', 'Dev@123')}
                sx={{
                  justifyContent: 'flex-start',
                  borderColor: '#CBD5E1',
                  py: 1,
                  '&:hover': {
                    borderColor: '#0D9488',
                    backgroundColor: 'rgba(13, 148, 136, 0.04)',
                  },
                }}
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: 'secondary.main' }}>
                    Developer (Sarah)
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                    sarah.dev@ivtex.com
                  </Typography>
                </Box>
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};
