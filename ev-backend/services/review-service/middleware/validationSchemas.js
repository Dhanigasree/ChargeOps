import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid resource id");

export const createReviewSchema = z.object({
  body: z.object({
    stationId: objectIdSchema,
    rating: z.number().int().min(1).max(5),
    comment: z.string().trim().max(500).optional()
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

export const reviewIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: objectIdSchema
  }),
  query: z.object({}).default({})
});

export const stationReviewSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    stationId: objectIdSchema
  }),
  query: z.object({}).default({})
});
