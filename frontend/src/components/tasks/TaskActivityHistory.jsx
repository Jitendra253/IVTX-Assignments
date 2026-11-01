import React from 'react';
import dayjs from 'dayjs';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Chip,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import { useGetTaskActivityQuery } from '../../store/api/apiSlice.js';

export const TaskActivityHistory = ({ taskId }) => {
  // Redux RTK Query hook
  const { data: activities = [], isLoading } = useGetTaskActivityQuery(taskId);

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <HistoryIcon sx={{ color: 'secondary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Activity Log ({activities.length})
          </Typography>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : activities.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
            No recorded activities for this task yet.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {activities.map((act) => (
              <Box
                key={act._id}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    mt: 0.75,
                    borderRadius: '50%',
                    backgroundColor: 'secondary.main',
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {act.actor?.name || 'System User'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {dayjs(act.createdAt).format('MMM D, YYYY h:mm A')}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      size="small"
                      label={act.action}
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundColor: '#F0FDFA',
                        color: '#0F766E',
                        border: '1px solid #99F6E4',
                      }}
                    />
                    {act.oldValue && act.newValue && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        from <strong style={{ color: '#0F172A' }}>{act.oldValue}</strong> to{' '}
                        <strong style={{ color: '#059669' }}>{act.newValue}</strong>
                      </Typography>
                    )}
                    {!act.oldValue && act.newValue && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {act.newValue}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
