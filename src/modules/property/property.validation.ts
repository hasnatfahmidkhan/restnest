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
  amenityIds: z.preprocess((value) => {
    if (value === undefined) return undefined;
    return Array.isArray(value) ? value : [value];
  }, z.array(z.string().trim()).optional()),
});

export const createPropertySchema = z.object({
  body: propertyValidationSchema,
});

const propertyParamsSchema = z.object({
  id: z.uuid("Invalid Property ID."),
});

export const getSignlePropertySchema = z.object({
  params: propertyParamsSchema,
});

export const updatePropertySchema = z.object({
  params: propertyParamsSchema,
  body: propertyValidationSchema.partial(),
});

export const deletePropertySchema = z.object({
  params: propertyParamsSchema,
});

export const propertyQuerySchema = z
  .object({
    // Pagination
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),

    // Search
    searchTerm: z.string().trim().min(1).optional(),

    // Sorting
    sortBy: z
      .enum(["createdAt", "rentPrice", "averageRating"])
      .default("createdAt"),

    sortOrder: z.enum(["asc", "desc"]).default("desc"),

    // Filters
    landlordId: z.uuid().optional(),

    city: z.string().trim().optional(),
    division: z.string().trim().optional(),
    category: z.string().trim().optional(),

    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),

    fromDate: z.coerce.date().optional(),
    toDate: z.coerce.date().optional(),

    amenity: z
      .preprocess((value) => {
        if (value === undefined || value === "") return undefined;


        if (typeof value === "string") {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            return [value]; 
          }
        }

        return Array.isArray(value) ? value : [value];
      }, z.array(z.string().trim()))
      .optional(),
  })
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.minPrice <= data.maxPrice,
    {
      path: ["minPrice"],
      message: "minPrice cannot be greater than maxPrice",
    },
  )
  .refine(
    (data) =>
      data.fromDate === undefined ||
      data.toDate === undefined ||
      data.fromDate <= data.toDate,
    {
      path: ["fromDate"],
      message: "fromDate must be before toDate",
    },
  );

export const getAllPropertiesQuerySchema = z.object({
  query: propertyQuerySchema,
});
