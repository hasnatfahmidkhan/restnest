import { z } from "zod";
import { RentalRequestStatus } from "../../../generated/prisma/enums";

const propertyIdSchema = z.uuid("Invalid property ID.");

const moveInDateSchema = z.coerce
  .date()
  .refine((date) => date > new Date(), "Move-in date must be in the future.");

const leaseMonthsSchema = z.coerce
  .number()
  .int("Lease duration must be an integer.")
  .min(1, "Lease duration must be at least 1 month.")
  .max(60, "Lease duration cannot exceed 60 months.");

const messageSchema = z
  .string()
  .trim()
  .max(500, "Message cannot exceed 500 characters.");

export const rentalRequestBodySchema = z.object({
  propertyId: propertyIdSchema,
  moveInDate: moveInDateSchema,
  leaseMonths: leaseMonthsSchema,
  message: messageSchema.optional(),
});

export const createRentalRequestSchema = z.object({
  body: rentalRequestBodySchema,
});

export const rentalRequestParamsSchema = z.object({
  params: z.object({
    rentalId: z.uuid("Invalid rental ID."),
  }),
});

export const updateRentalRequestSchema = z.object({
  body: rentalRequestBodySchema
    .omit({
      propertyId: true,
    })
    .partial(),
});

export const updateRentalRequestStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid rental request ID."),
  }),
  body: z.object({
    status: z.enum([
      RentalRequestStatus.APPROVED,
      RentalRequestStatus.REJECTED,
    ]),
  }),
});
