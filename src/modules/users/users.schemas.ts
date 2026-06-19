import { z } from 'zod';

const nameField = z.string().min(1);
const emailField = z.string().email().toLowerCase();

export const createUserSchema = z.object({
  name: nameField,
  email: emailField,
});

export const updateUserSchema = z.object({
  name: nameField.optional(),
  email: emailField.optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type User = { id: string; name: string; email: string; createdAt: Date | string };
