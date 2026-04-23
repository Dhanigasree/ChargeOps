import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(100).optional(),
      phone: z.string().trim().min(8).max(20).optional()
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required"
    }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});
