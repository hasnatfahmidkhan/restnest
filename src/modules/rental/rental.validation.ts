import { z } from "zod";

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

export const updateRentalRequestSchema = z.object({
  body: rentalRequestBodySchema
    .omit({
      propertyId: true,
    })
    .partial(),
});
