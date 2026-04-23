import { z } from "zod";
import { USER_ROLES } from "../models/User.js";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid resource id");

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email(),
    password: z
      .string()
      .min(8)
      .max(100)
      .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "Password must include at least one letter and one number"),
    phone: z.string().trim().min(8).max(20).optional(),
    role: z.enum(USER_ROLES).optional()
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    password: z.string().min(8).max(100)
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

export const updateRoleSchema = z.object({
  body: z.object({
    role: z.enum(USER_ROLES),
    isActive: z.boolean().optional()
  }),
  params: z.object({
    userId: objectIdSchema
  }),
  query: z.object({}).default({})
});
