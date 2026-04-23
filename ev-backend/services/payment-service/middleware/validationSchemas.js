import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid resource id");

export const createPaymentSchema = z.object({
  body: z.object({
    bookingId: objectIdSchema,
    amount: z.number().min(0),
    paymentMethod: z.enum(["card", "upi", "wallet", "netbanking"])
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

export const paymentIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: objectIdSchema
  }),
  query: z.object({}).default({})
});
