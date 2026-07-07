import { z } from "zod";

export const propertyValidationSchema = z.object({
  title: z
    .string({ error: "Title is required!" })
    .min(3, "Title must be at least 3 characters.")
    .max(255, "Title cannot exceed 255 characters."),

  description: z.string().max(5000, "Description is too long.").optional(),

  rentPrice: z.coerce
    .number({ error: "Rent Price is required!" })
    .positive("Rent price must be greater than 0."),

  address: z.string().min(3, "Address is required."),

  city: z.string().min(2, "City is required.").max(100),

  division: z.string().min(2, "Division is required.").max(100),

  bedrooms: z.coerce.number().int().min(0).default(0),

  bathrooms: z.coerce.number().int().min(0).default(0),

  area: z.coerce.number().int().positive().optional(),

  categoryId: z.uuid("Invalid Category ID."),
});

export const createPropertySchema = z.object({
  body: propertyValidationSchema,
});

const propertyParamsSchema = z.object({
  id: z.uuid("Invalid Property ID."),
});

export const updatePropertySchema = z.object({
  params: propertyParamsSchema,
  body: propertyValidationSchema.partial(),
});

export const deletePropertySchema = z.object({
  params: propertyParamsSchema,
});
