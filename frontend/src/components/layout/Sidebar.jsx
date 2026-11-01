import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import PeopleIcon from '@mui/icons-material/People';
import CloseIcon from '@mui/icons-material/Close';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { setSidebarOpen } from '../../store/slices/uiSlice.js';

const DRAWER_WIDTH = 260;

export const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
    { label: 'Projects', path: '/projects', icon: FolderIcon },
    { label: 'All Tasks', path: '/tasks', icon: AssignmentIcon },
    { label: 'My Tasks', path: '/my-tasks', icon: TaskAltIcon },
    { label: 'Team Members', path: '/team', icon: PeopleIcon },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    if (mobileOpen) onMobileClose();
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
      {/* Brand Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #2563EB 0%, #0D9488 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
          >
            <RocketLaunchIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, color: '#0F172A' }}>
              TaskFlow
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              IVTEX Enterprise
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onMobileClose}
          sx={{ display: { md: 'none' }, color: 'text.secondary' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: '#E2E8F0' }} />

      {/* Role Pill */}
      {user && (
        <Box sx={{ px: 2.5, py: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2.5,
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
              Signed in as
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', noWrap: true }}>
              {user.name}
            </Typography>
            <Chip
              size="small"
              label={user.role === 'Admin' ? 'Admin / Team Lead' : 'Developer / Member'}
              sx={{
                mt: 0.75,
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 700,
                backgroundColor: user.role === 'Admin' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(13, 148, 136, 0.1)',
                color: user.role === 'Admin' ? '#2563EB' : '#0D9488',
              }}
            />
          </Box>
        </Box>
      )}

      {/* Navigation List */}
      <List sx={{ px: 1.5, py: 1, flexGrow: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          const IconComponent = item.icon;

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  px: 2,
                  backgroundColor: isActive ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                  color: isActive ? '#2563EB' : '#64748B',
                  border: isActive ? '1px solid rgba(37, 99, 235, 0.2)' : '1px solid transparent',
                  '&:hover': {
                    backgroundColor: isActive ? 'rgba(37, 99, 235, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                    color: '#0F172A',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 38,
                    color: isActive ? '#2563EB' : '#64748B',
                  }}
                >
                  <IconComponent fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 700 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer System Status */}
      <Box sx={{ p: 2, m: 2, borderRadius: 2, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981' }} />
          <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
            API System Healthy
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.5, fontSize: '0.65rem' }}>
          IVTEX Sprint v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Persistent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Mobile / Tablet Temporary Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: '#FFFFFF',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};
