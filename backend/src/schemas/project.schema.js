import { z } from 'zod';

export const createProjectSchema = z
  .object({
    name: z.string().trim().min(3, 'Project name must be at least 3 characters').max(150),
    projectKey: z
      .string()
      .trim()
      .min(2, 'Project key must be at least 2 characters')
      .max(15, 'Project key cannot exceed 15 characters')
      .regex(/^[A-Za-z0-9_-]+$/, 'Project key must contain only alphanumeric characters, dashes, or underscores'),
    description: z.string().trim().max(2000).optional().default(''),
    status: z.enum(['Planning', 'Active', 'On Hold', 'Completed']).default('Planning'),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Valid start date required',
    }),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Valid end date required',
    }),
    members: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')).optional().default([]),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date cannot be prior to start date',
    path: ['endDate'],
  });

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(3).max(150).optional(),
    projectKey: z
      .string()
      .trim()
      .min(2)
      .max(15)
      .regex(/^[A-Za-z0-9_-]+$/)
      .optional(),
    description: z.string().trim().max(2000).optional(),
    status: z.enum(['Planning', 'Active', 'On Hold', 'Completed']).optional(),
    startDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Valid start date required' })
      .optional(),
    endDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Valid end date required' })
      .optional(),
    members: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')).optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'End date cannot be prior to start date',
      path: ['endDate'],
    }
  );
