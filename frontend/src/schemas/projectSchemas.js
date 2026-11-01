import { z } from 'zod';

export const projectFormSchema = z
  .object({
    name: z.string().trim().min(3, 'Project name must be at least 3 characters').max(150),
    projectKey: z
      .string()
      .trim()
      .min(2, 'Key must be at least 2 characters')
      .max(15, 'Key cannot exceed 15 characters')
      .regex(/^[A-Za-z0-9_-]+$/, 'Letters, numbers, dash or underscore only'),
    description: z.string().trim().max(2000).optional().default(''),
    status: z.enum(['Planning', 'Active', 'On Hold', 'Completed']),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    members: z.array(z.string()).optional().default([]),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date cannot be earlier than start date',
    path: ['endDate'],
  });
