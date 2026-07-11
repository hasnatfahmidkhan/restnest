import { z } from "zod";

export const getAllUsersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),

    searchTerm: z.string().trim().optional(),

    role: z.enum(["ADMIN", "LANDLORD", "TENANT"]).optional(),

    status: z.enum(["ACTIVE", "BANNED"]).optional(),

    sortBy: z.enum(["createdAt", "name", "email"]).default("createdAt"),

    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});
