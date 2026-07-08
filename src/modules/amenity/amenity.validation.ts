import { z } from "zod";

const amenityNameSchema = z
  .string()
  .trim()
  .min(2, "Amenity name must be at least 2 characters.")
  .max(100, "Amenity name cannot exceed 100 characters.");

const paramsIdSchema = z.object({
  id: z.uuid({
    error: "Amenity ID is required in params.",
  }),
});

export const createAmenitySchema = z.object({
  body: z.object({
    name: amenityNameSchema,
  }),
});

export const updateAmenitySchema = z.object({
  params: paramsIdSchema,
  body: z.object({
    name: amenityNameSchema,
  }),
});

export const deleteAmenitySchema = z.object({
  params: paramsIdSchema,
});
