import React from 'react';
import { Chip, Box } from '@mui/material';

const statusConfig = {
  'To Do': { bg: '#F1F5F9', text: '#334155', dot: '#64748B', border: '#CBD5E1' },
  'In Progress': { bg: '#EFF6FF', text: '#1D4ED8', dot: '#2563EB', border: '#BFDBFE' },
  'Under Review': { bg: '#FFFBEB', text: '#92400E', dot: '#D97706', border: '#FDE68A' },
  'Completed': { bg: '#ECFDF5', text: '#065F46', dot: '#059669', border: '#A7F3D0' },
  'Planning': { bg: '#F0FDFA', text: '#0F766E', dot: '#0D9488', border: '#99F6E4' },
  'Active': { bg: '#ECFDF5', text: '#065F46', dot: '#059669', border: '#A7F3D0' },
  'On Hold': { bg: '#FEF2F2', text: '#991B1B', dot: '#DC2626', border: '#FECACA' },
};

export const StatusChip = ({ status, size = 'small' }) => {
  const config = statusConfig[status] || {
    bg: '#F8FAFC',
    text: '#475569',
    dot: '#64748B',
    border: '#E2E8F0',
  };

  return (
    <Chip
      size={size}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: config.dot,
            }}
          />
          {status}
        </Box>
      }
      sx={{
        backgroundColor: config.bg,
        color: config.text,
        fontWeight: 700,
        fontSize: size === 'small' ? '0.75rem' : '0.85rem',
        border: `1px solid ${config.border}`,
        '& .MuiChip-label': { px: 1 },
      }}
    />
  );
};
