import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

export const ProjectProgress = ({
  percentage = 0,
  completedTasks = 0,
  totalTasks = 0,
  overdueTasks = 0,
  showDetails = true,
  height = 8,
}) => {
  const rounded = Math.min(100, Math.max(0, Math.round(percentage)));

  // Determine progress color
  let color = '#6366F1';
  if (rounded === 100) color = '#10B981';
  else if (rounded > 60) color = '#06B6D4';
  else if (rounded > 30) color = '#6366F1';
  else if (overdueTasks > 0) color = '#F43F5E';

  return (
    <Box sx={{ width: '100%' }}>
      {showDetails && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {completedTasks} of {totalTasks} tasks completed
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {overdueTasks > 0 && (
              <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 700 }}>
                {overdueTasks} overdue
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 700 }}>
              {rounded}%
            </Typography>
          </Box>
        </Box>
      )}

      <LinearProgress
        variant="determinate"
        value={rounded}
        sx={{
          height,
          borderRadius: height / 2,
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          '& .MuiLinearProgress-bar': {
            borderRadius: height / 2,
            background:
              rounded === 100
                ? 'linear-gradient(90deg, #10B981 0%, #34D399 100%)'
                : `linear-gradient(90deg, ${color} 0%, ${color}CC 100%)`,
          },
        }}
      />
    </Box>
  );
};
