import { z } from "zod";
import { UserStatus } from "../../../generated/prisma/enums";

export const getAllUsersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),

    searchTerm: z.string().trim().optional(),

    role: z.enum(["ADMIN", "LANDLORD", "TENANT"]).optional(),

    status: z.enum(UserStatus).optional(),

    sortBy: z.enum(["createdAt", "name", "email"]).default("createdAt"),

    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const userStatusUpdateSchema = z.object({
  params: z.object({
    id: z.uuid("Invalid user id"),
  }),
  body: z.object({
    status: z.enum(UserStatus),
  }),
});
