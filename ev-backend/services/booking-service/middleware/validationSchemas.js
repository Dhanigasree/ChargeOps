import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid resource id");

export const createBookingSchema = z.object({
  body: z.object({
    stationId: objectIdSchema,
    slotTime: z.coerce.date(),
    amount: z.number().min(0)
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

export const bookingIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    bookingId: objectIdSchema
  }),
  query: z.object({}).default({})
});

export const stationBookingsSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    stationId: objectIdSchema
  }),
  query: z.object({}).default({})
});

export const updatePaymentStatusSchema = z.object({
  body: z.object({
    paymentStatus: z.enum(["unpaid", "paid", "refunded"])
  }),
  params: z.object({
    bookingId: objectIdSchema
  }),
  query: z.object({}).default({})
});
