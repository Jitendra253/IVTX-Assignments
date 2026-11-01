import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().trim().max(5000).optional().default(''),
    project: z.string().regex(objectIdRegex, 'Invalid project ID format'),
    assignee: z.string().regex(objectIdRegex, 'Invalid assignee ID format'),
    priority: z.enum(['High', 'Medium', 'Low']).default('Medium'),
    status: z.enum(['To Do', 'In Progress', 'Under Review', 'Completed']).default('To Do'),
    progress: z.number().min(0).max(100).optional(),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Valid start date required',
    }),
    dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Valid due date required',
    }),
  })
  .refine((data) => new Date(data.dueDate) >= new Date(data.startDate), {
    message: 'Due date cannot precede start date',
    path: ['dueDate'],
  })
  .transform((data) => {
    // Apply initial status-to-progress defaults if progress not provided or enforce rules
    let progress = data.progress;
    if (progress === undefined) {
      if (data.status === 'Completed') progress = 100;
      else if (data.status === 'In Progress') progress = 10;
      else progress = 0;
    } else {
      if (data.status === 'Completed') progress = 100;
      else if (data.status === 'To Do') progress = 0;
      else if (data.status === 'In Progress') {
        if (progress <= 0) progress = 1;
        if (progress >= 100) progress = 99;
      }
    }
    return { ...data, progress };
  });

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(3).max(200).optional(),
    description: z.string().trim().max(5000).optional(),
    project: z.string().regex(objectIdRegex, 'Invalid project ID format').optional(),
    assignee: z.string().regex(objectIdRegex, 'Invalid assignee ID format').optional(),
    priority: z.enum(['High', 'Medium', 'Low']).optional(),
    status: z.enum(['To Do', 'In Progress', 'Under Review', 'Completed']).optional(),
    progress: z.number().min(0).max(100).optional(),
    startDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Valid start date required' })
      .optional(),
    dueDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Valid due date required' })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.dueDate) {
        return new Date(data.dueDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'Due date cannot precede start date',
      path: ['dueDate'],
    }
  );

export const updateTaskStatusSchema = z.object({
  status: z.enum(['To Do', 'In Progress', 'Under Review', 'Completed'], {
    errorMap: () => ({ message: 'Status must be To Do, In Progress, Under Review, or Completed' }),
  }),
});

export const updateTaskProgressSchema = z.object({
  progress: z.number().min(0, 'Progress must be at least 0').max(100, 'Progress cannot exceed 100'),
});

export const createCommentSchema = z.object({
  comment: z.string().trim().min(1, 'Comment cannot be empty').max(3000, 'Comment cannot exceed 3000 characters'),
});
