import React from 'react';
import { Chip } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';

const priorityConfig = {
  High: { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA', icon: '#DC2626' },
  Medium: { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', icon: '#D97706' },
  Low: { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', icon: '#2563EB' },
};

export const PriorityChip = ({ priority = 'Medium', size = 'small' }) => {
  const config = priorityConfig[priority] || priorityConfig.Medium;

  return (
    <Chip
      size={size}
      icon={<FlagIcon sx={{ fontSize: '14px !important', color: `${config.icon} !important` }} />}
      label={priority}
      sx={{
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        fontWeight: 700,
        fontSize: size === 'small' ? '0.75rem' : '0.85rem',
      }}
    />
  );
};
