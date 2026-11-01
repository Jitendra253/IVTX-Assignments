import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = '#6366F1',
  trend,
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        '&:hover': onClick
          ? {
              transform: 'translateY(-3px)',
              borderColor: color,
              boxShadow: `0 12px 28px -6px ${color}33`,
            }
          : {},
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${color} 0%, transparent 100%)`,
        }}
      />
      <CardContent
        sx={{
          p: 2.5,
          '&:last-child': { pb: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              mb: 1.5,
              minHeight: 44,
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, lineHeight: 1.3 }}>
              {title}
            </Typography>
            {Icon && (
              <Avatar
                variant="rounded"
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: `${color}1A`,
                  color: color,
                  borderRadius: 2.5,
                  flexShrink: 0,
                  ml: 1,
                }}
              >
                <Icon fontSize="small" />
              </Avatar>
            )}
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1, lineHeight: 1.1 }}>
            {value}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mt: 'auto', minHeight: 24 }}>
          {trend && (
            <Typography
              variant="caption"
              sx={{
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                fontWeight: 700,
                backgroundColor: trend.type === 'positive' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                color: trend.type === 'positive' ? '#10B981' : '#F43F5E',
                display: 'inline-block',
                lineHeight: 1.2,
              }}
            >
              {trend.label}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.2 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
