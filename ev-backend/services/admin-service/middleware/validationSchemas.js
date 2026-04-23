import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid resource id");

export const updateStationApprovalSchema = z.object({
  body: z.object({
    isApproved: z.boolean().default(true)
  }),
  params: z.object({
    id: objectIdSchema
  }),
  query: z.object({}).default({})
});
