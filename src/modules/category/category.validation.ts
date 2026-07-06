import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object(
    {
      name: z
        .string({ error: "Category name is required" })
        .trim()
        .min(1, "Category name cannot be empty")
        .max(255, "Category name cannot exceed 255 characters"),
    },
    { error: "Request body is required" },
  ),
});

const categoryIdParamsSchema = z.object({
  params: z.object({
    categoryId: z.uuid("Invalid category ID format"),
  }),
});

export const updateCategorySchema = z.object({
  // `shape.body` reuses the body validation from createCategorySchema.
  // `partial()` makes all body fields optional for PATCH requests.
  body: createCategorySchema.shape.body.partial(),
  // `shape.params` reuses the params validation from categoryIdParamsSchema.
  params: categoryIdParamsSchema.shape.params,
});

export const deleteCategorySchema = categoryIdParamsSchema;
