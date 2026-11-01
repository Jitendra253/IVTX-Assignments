import React from 'react';
import { Box, Typography, Button, Avatar } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

export const EmptyState = ({
  icon: Icon = InboxOutlinedIcon,
  title = 'No items found',
  description = 'There are no records matching your current filter criteria.',
  actionText,
  onAction,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 7,
        px: 3,
        border: '1px dashed #CBD5E1',
        borderRadius: 4,
        backgroundColor: '#F8FAFC',
      }}
    >
      <Avatar
        sx={{
          width: 56,
          height: 56,
          backgroundColor: 'rgba(99, 102, 241, 0.12)',
          color: 'primary.main',
          mb: 2,
        }}
      >
        <Icon sx={{ fontSize: 28 }} />
      </Avatar>

      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
        {title}
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 420, mb: actionText ? 2.5 : 0 }}>
        {description}
      </Typography>

      {actionText && (
        <Button variant="contained" color="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Box>
  );
};
