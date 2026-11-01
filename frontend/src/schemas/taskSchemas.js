import { z } from 'zod';

export const taskFormSchema = z
  .object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().trim().max(5000).optional().default(''),
    project: z.string().min(1, 'Project selection is required'),
    assignee: z.string().min(1, 'Assignee selection is required'),
    priority: z.enum(['High', 'Medium', 'Low']),
    status: z.enum(['To Do', 'In Progress', 'Under Review', 'Completed']),
    progress: z.number().min(0).max(100),
    startDate: z.string().min(1, 'Start date is required'),
    dueDate: z.string().min(1, 'Due date is required'),
  })
  .refine((data) => new Date(data.dueDate) >= new Date(data.startDate), {
    message: 'Due date cannot be earlier than start date',
    path: ['dueDate'],
  });

export const commentFormSchema = z.object({
  comment: z.string().trim().min(1, 'Comment cannot be empty').max(3000),
});
