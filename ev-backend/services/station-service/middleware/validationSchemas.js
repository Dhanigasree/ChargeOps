import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid resource id");

const locationSchema = z.object({
  state: z.string().trim().min(2).max(100).optional(),
  district: z.string().trim().min(2).max(100).optional(),
  locality: z.string().trim().min(2).max(120).optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().trim().min(5).max(255)
});

export const createStationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    location: locationSchema,
    chargerType: z.string().trim().min(2).max(100),
    pricePerUnit: z.number().min(0),
    availability: z.object({
      slots: z.number().int().min(0)
    }),
    isApproved: z.boolean().optional()
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

export const updateStationSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(120).optional(),
      location: locationSchema.partial().optional(),
      chargerType: z.string().trim().min(2).max(100).optional(),
      pricePerUnit: z.number().min(0).optional(),
      availability: z
        .object({
          slots: z.number().int().min(0).optional()
        })
        .optional(),
      isApproved: z.boolean().optional()
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required"
    }),
  params: z.object({
    stationId: objectIdSchema
  }),
  query: z.object({}).default({})
});

export const stationIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    stationId: objectIdSchema
  }),
  query: z.object({}).default({})
});

export const stationFilterSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: z.object({
    address: z.string().trim().min(1).optional(),
    state: z.string().trim().min(1).optional(),
    district: z.string().trim().min(1).optional(),
    chargerType: z.string().trim().min(1).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    isApproved: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => (typeof value === "string" ? value === "true" : undefined))
  })
});
