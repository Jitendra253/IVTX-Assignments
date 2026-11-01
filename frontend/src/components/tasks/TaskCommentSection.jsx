import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Card,
  CardContent,
  CircularProgress,
  Divider,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useGetTaskCommentsQuery, useAddTaskCommentMutation } from '../../store/api/apiSlice.js';
import { commentFormSchema } from '../../schemas/taskSchemas.js';
import { showSnackbar } from '../../store/slices/uiSlice.js';

dayjs.extend(relativeTime);

export const TaskCommentSection = ({ taskId }) => {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(commentFormSchema),
    defaultValues: { comment: '' },
  });

  // Redux RTK Query hooks
  const { data: comments = [], isLoading } = useGetTaskCommentsQuery(taskId);
  const [addTaskComment, { isLoading: isPosting }] = useAddTaskCommentMutation();

  const onSubmit = async (values) => {
    try {
      await addTaskComment({ taskId, comment: values.comment }).unwrap();
      reset();
      dispatch(showSnackbar({ message: 'Comment added successfully', severity: 'success' }));
    } catch (err) {
      dispatch(
        showSnackbar({
          message: err.data?.message || 'Failed to post comment',
          severity: 'error',
        })
      );
    }
  };

  const getInitials = (name = '') =>
    name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <ChatBubbleOutlineIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Comments ({comments.length})
          </Typography>
        </Box>

        {/* Comment Input Box */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mb: 4 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Write a progress update or technical comment..."
            {...register('comment')}
            error={Boolean(errors.comment)}
            helperText={errors.comment?.message}
            sx={{ mb: 1.5 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isPosting}
              startIcon={
                isPosting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <SendIcon fontSize="small" />
                )
              }
            >
              Post Comment
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2.5, borderColor: 'rgba(255, 255, 255, 0.06)' }} />

        {/* Comments Feed */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : comments.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
            No comments posted yet. Be the first to share an update.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {comments.map((c) => (
              <Box key={c._id} sx={{ display: 'flex', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: c.user?.role === 'Admin' ? '#6366F1' : '#06B6D4',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  {getInitials(c.user?.name)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {c.user?.name || 'User'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                      • {dayjs(c.createdAt).fromNow()}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#334155',
                      backgroundColor: '#F8FAFC',
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid #E2E8F0',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {c.comment}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
