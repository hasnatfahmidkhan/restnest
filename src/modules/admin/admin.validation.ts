import { z } from "zod";
import {
  PaymentStatus,
  RentalRequestStatus,
  UserStatus,
} from "../../../generated/prisma/enums";

const searchPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),

  searchTerm: z.string().trim().optional(),
});

export const getAllUsersQuerySchema = z.object({
  query: searchPaginationSchema.extend({
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

export const getAllPropertiesQuerySchema = z.object({
  query: searchPaginationSchema.extend({
    city: z.string().optional(),
    division: z.string().optional(),
    category: z.uuid().optional(),
    landlordId: z.uuid().optional(),

    availability: z.coerce.boolean().optional(),

    sortBy: z.enum(["createdAt", "rentPrice"]).default("createdAt"),

    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const getAllRentalsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),

    searchTerm: z.string().optional(),

    status: z.enum(RentalRequestStatus).optional(),
    paymentStatus: z.enum(PaymentStatus).optional(),

    tenantId: z.uuid().optional(),
    landlordId: z.uuid().optional(),
    propertyId: z.uuid().optional(),

    sortBy: z.enum(["createdAt", "moveInDate", "endDate"]).default("createdAt"),

    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});
