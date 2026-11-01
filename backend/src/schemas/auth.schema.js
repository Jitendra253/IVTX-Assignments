import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Admin', 'Developer'], {
    errorMap: () => ({ message: 'Role must be either Admin or Developer' }),
  }),
  isActive: z.boolean().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().optional(),
  role: z.enum(['Admin', 'Developer']).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
});
