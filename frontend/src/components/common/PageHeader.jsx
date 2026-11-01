import React from 'react';
import { Box, Typography, Button } from '@mui/material';

export const PageHeader = ({
  title,
  subtitle,
  actionText,
  actionIcon: ActionIcon,
  onActionClick,
  extraActions,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
        mb: 3.5,
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        {extraActions}
        {actionText && (
          <Button
            variant="contained"
            color="primary"
            startIcon={ActionIcon ? <ActionIcon /> : null}
            onClick={onActionClick}
            sx={{ fontWeight: 700 }}
          >
            {actionText}
          </Button>
        )}
      </Box>
    </Box>
  );
};
