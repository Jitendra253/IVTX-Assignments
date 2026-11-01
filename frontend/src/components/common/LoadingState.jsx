import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export const LoadingState = ({ message = 'Loading data, please wait...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        gap: 2,
      }}
    >
      <CircularProgress size={44} thickness={4} sx={{ color: 'primary.main' }} />
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
        {message}
      </Typography>
    </Box>
  );
};
